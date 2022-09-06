import argparse
from catalog_spider import CatalogSpider
from scrapy.crawler import CrawlerProcess
from typing import Final


LOG_LEVELS: Final[list[str]] = [
    'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']


def _get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Runs the course catalog web scraper.')
    parser.add_argument('-L', '--loglevel', action='store', choices=LOG_LEVELS,
                        default='INFO', metavar='LEVEL', dest="log_level",
                        help='minimum log level to output (DEBUG, INFO, WARNING, ERROR, or CRITICAL); defaults to INFO')
    parser.add_argument('--logfile', action='store', metavar='path/to/file',
                        dest='log_file', help='file to write log messages to (existing file will be overwritten); defaults to stderr')
    parser.add_argument('--nolog', action='store_false', dest='log_enabled',
                        help='silence logs entirely')
    return parser.parse_args()


if __name__ == '__main__':
    args = _get_args()
    process = CrawlerProcess(settings={
        'LOG_ENABLED': args.log_enabled,
        'LOG_FILE': args.log_file,
        'LOG_FILE_APPEND': False,
        'LOG_LEVEL': args.log_level,
    })
    process.crawl(CatalogSpider)
    process.start()
