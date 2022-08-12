import scrapy


class CatalogSpider(scrapy.Spider):
    name = "catalog"
    start_urls = ["https://catalog.ucsd.edu/front/courses.html"]

    def parse(self, response):
        with open('test.html', 'wb') as f:
            f.write(response.body)
