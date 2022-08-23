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

    def __init__(self, name=None, **kwargs):
        super().__init__(name, **kwargs)
        self.metrics = ScrapingMetrics()
        self.parser = CourseInfoParser(self.logger, self.metrics)

    def closed(self, reason):
        self.metrics.pretty_print()

    def parse(self, response):
        selectors = response.xpath(
            '//span[@class="courseFacLink"]/a[text()[contains(.,"courses")]]/@href')
        self.logger.info('Found %d department course pages', len(selectors))
        self.metrics.set_departments(len(selectors))
        for link in selectors.getall():
            yield response.follow(link, callback=self.parse_courses)

    def parse_courses(self, response):
        dept = self._department_from_url(response.url)
        name_selectors = response.xpath(
            '//p[@class="course-name"]').xpath('string()')
        description_selectors = response.xpath(
            '//p[@class="course-name"]/following-sibling::p[1]').xpath('string()')

        num_courses = len(name_selectors)
        num_descriptions = len(description_selectors)
        difference = num_courses - num_descriptions
        self.logger.info('Found %d courses in department %s',
                         num_courses, dept)
        self.metrics.add_courses(num_courses)
        if difference > 0:
            self.logger.error('Found %d more course names than descriptions in department %s',
                              difference, dept)
            self.metrics.add_missing_descriptions(difference)
        elif difference < 0:
            self.logger.error('Found %d more course descriptions than names in department %s',
                              -difference, dept)
            self.metrics.add_extra_descriptions(-difference)

        for i, line in enumerate(name_selectors.getall()):
            course_info = self.parser.parse_course(line)
            if course_info is not None:
                subject, number, title, units = course_info
                prerequisites = None
                self.logger.info('%s %s', subject, number)
                if i < num_descriptions:
                    prerequisites = self.parser.parse_prerequisites(
                        description_selectors[i].get())
                    # self.logger.info('Prerequisites for %s %s: %s',
                    #                  subject, number, prerequisites)
                # yield {
                #     'dept': dept,
                #     'code': f'{subject} {number}',
                #     'title': title,
                #     'units': units
                # }

    def _department_from_url(self, url):
        start, end = url.rfind('/') + 1, url.rfind('.')
        return url[start:end].upper()
