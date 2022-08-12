import scrapy


class CatalogSpider(scrapy.Spider):
    name = 'catalog'
    start_urls = ['https://catalog.ucsd.edu/front/courses.html']

    def parse(self, response):
        selectors = response.xpath(
            '//span[@class="courseFacLink"]/a[text()[contains(.,"courses")]]/@href')
        for link in selectors.getall():
            yield response.follow(link, callback=self.parse_courses)

    def parse_courses(self, response):
        print(response.xpath('//h1/text()').get())
