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
        i = 0
        for link in selectors.getall():
            if i >= 30:
                break
            i += 1
            yield response.follow(link, callback=self.parse_courses)

    def parse_courses(self, response):
        dept = self._department_from_url(response.url)
        name_selectors = response.xpath('//p[@class="course-name"]/text()')
        # description_selectors = response.xpath(
        #     '//p[@class="course-name"]/following-sibling::p[@class="course-descriptions"][1]'
        # ).xpath('string()')
        for line in name_selectors.getall():
            match = course_info_matcher.match(line)
            if match is None:
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
        return code[:index]
