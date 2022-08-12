import re
import scrapy

course_info_matcher = re.compile(
    r'^\s*(?P<code>.+?)\.\s*(?P<title>.+?)\s*\((?P<units>.+?)\)')


class CatalogSpider(scrapy.Spider):
    name = 'catalog'
    start_urls = ['https://catalog.ucsd.edu/front/courses.html']

    def parse(self, response):
        selectors = response.xpath(
            '//span[@class="courseFacLink"]/a[text()[contains(.,"courses")]]/@href')
        i = 0
        for link in selectors.getall():
            if i >= 20:
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
            yield {
                'dept': dept,
                'code': code,
                'title': title,
                'units': units
            }

    def _department_from_url(self, url):
        start, end = url.rfind('/') + 1, url.rfind('.')
        return url[start:end].upper()
