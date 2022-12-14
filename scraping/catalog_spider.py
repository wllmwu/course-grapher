from course_parser import CourseInfoParser
from metrics import ScrapingMetrics
from pipeline import PerDepartmentExportPipeline
import scrapy


class CatalogSpider(scrapy.Spider):
    """
    Crawls the UCSD course catalog by department and scrapes information about
    each course. Stores data through the `PerDepartmentExportPipeline`.
    """

    name = 'catalogspider'
    start_urls = ['https://catalog.ucsd.edu/front/courses.html']
    custom_settings = {
        'ITEM_PIPELINES': {
            PerDepartmentExportPipeline: 1
        }
    }

    def __init__(self, dry_run=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.metrics = ScrapingMetrics()
        self.parser = CourseInfoParser(self.logger, self.metrics)
        self.dry_run = bool(dry_run)
        if self.dry_run:
            self.logger.info('This is a dry run! No data will be written')

    def closed(self, reason):
        self.metrics.pretty_print()

    def parse(self, response):
        selectors = response.css('span.courseFacLink').xpath(
            './a[text()[contains(.,"courses")]]/@href')
        self.logger.info('Found %d department course pages', len(selectors))
        self.metrics.set_departments(len(selectors))
        for link in selectors.getall():
            yield response.follow(link, callback=self.parse_courses)

    def parse_courses(self, response):
        dept = self._department_from_url(response.url)
        dept_name = response.xpath(
            '//h1').xpath('string()').re_first(r'^[^(]*')
        if dept_name is None:
            self.logger.error('Failed to parse name of department %s', dept)
        else:
            dept_name = dept_name.strip()

        title_line_selectors = response.css('p.course-name')
        self.logger.info('Found %d courses in department %s',
                         len(title_line_selectors), dept)
        self.metrics.add_courses(len(title_line_selectors))

        if not self.dry_run:
            yield {
                'file': 'departments',
                'code': dept,
                'name': dept_name,
                'link': response.url
            }
        for selector in title_line_selectors:
            title_line = selector.xpath('string()').get()
            course_info = self.parser.parse_course(title_line)
            if course_info is None:
                continue
            subject, number, title, units = course_info
            self.logger.info('%s %s', subject, number)

            result = {
                'file': dept,
                'code': f'{subject} {number}',
                'title': title,
                'units': units,
                'dept': dept
            }

            anchor = selector.xpath(
                './preceding-sibling::p[1]/a/@id|./preceding-sibling::a[1]/@id').get()
            if anchor is None:
                self.logger.warning('No anchor tag for %s %s', subject, number)
                self.metrics.inc_missing_anchors()
            else:
                result['anchor'] = anchor

            description = selector.xpath(
                './following-sibling::p[1]').xpath('string()').get()
            if description is None:
                self.logger.error(
                    'Missing description for %s %s', subject, number)
                self.metrics.inc_missing_descriptions()
                result['description'] = 'Missing description'
            else:
                result['description'] = description
                prereqs, coreqs = self.parser.parse_requirements(
                    description)
                if prereqs is not None:
                    result['prereqs'] = prereqs
                if coreqs is not None:
                    result['coreqs'] = coreqs

            if not self.dry_run:
                yield result

    def _department_from_url(self, url):
        start, end = url.rfind('/') + 1, url.rfind('.')
        return url[start:end].upper()
