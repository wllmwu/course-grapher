from pipeline import PerDepartmentExportPipeline
import re
import scrapy


course_info_matcher = re.compile(
    r'^\s*(?P<code>.+?)\.\s*(?P<title>.+?)\s*\((?P<units>.+?)\)')


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

    def parse(self, response):
        selectors = response.xpath(
            '//span[@class="courseFacLink"]/a[text()[contains(.,"courses")]]/@href')
        self.logger.info('Found %d department course pages', len(selectors))
        i = 0
        for link in selectors.getall():
            if i >= 30:
                break
            i += 1
            yield response.follow(link, callback=self.parse_courses)

    def parse_courses(self, response):
        dept = self._department_from_url(response.url)
        name_selectors = response.xpath(
            '//p[@class="course-name"]').xpath('string()')
        # description_selectors = response.xpath(
        #     '//p[@class="course-name"]/following-sibling::p[@class="course-descriptions"][1]'
        # ).xpath('string()')
        self.logger.info('Found %d courses in department %s',
                         len(name_selectors), dept)
        for line in name_selectors.getall():
            match = course_info_matcher.match(line)
            if match is None:
                self.logger.error('Failed to match course info: "%s"', line)
                continue
            code, title, units = match.group('code', 'title', 'units')
            code = self._remove_cross_listings(code)
            yield {
                'dept': dept,
                'code': code,
                'title': title,
                'units': units
            }

    def _department_from_url(self, url):
        start, end = url.rfind('/') + 1, url.rfind('.')
        return url[start:end].upper()

    def _remove_cross_listings(self, code):
        index = code.find('/')
        if index == -1:
            return code
        self.logger.warning('Ignored cross-listing: %s', code)
        # code may look like "ABC 101/DEF 102" or "ABC/DEF 101" or "ABC 101/201"
        new_code = code[:index]
        if re.search(r'\d', new_code) is None:
            new_code += code[code.rfind(' '):]
        return new_code
