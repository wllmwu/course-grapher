import argparse
from catalog_spider import CatalogSpider
from scrapy.crawler import CrawlerProcess


def _get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Runs the course catalog web scraper.')
    return parser.parse_args()


if __name__ == '__main__':
    args = _get_args()
    process = CrawlerProcess(settings={
        'LOG_LEVEL': 'INFO'
    })
    process.crawl(CatalogSpider)
    process.start()
