from itemadapter import ItemAdapter
from scrapy.exporters import JsonLinesItemExporter


class PerDepartmentExportPipeline:
    """
    https://docs.scrapy.org/en/latest/topics/exporters.html#using-item-exporters
    """

    def open_spider(self, spider):
        self.dept_to_exporter = {}

    def close_spider(self, spider):
        for exporter, file in self.dept_to_exporter.values():
            exporter.finish_exporting()
            file.close()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        exporter = self._exporter_for_item(adapter)
        del adapter['dept']
        exporter.export_item(item)
        return item

    def _exporter_for_item(self, item):
        dept = item['dept']
        if dept not in self.dept_to_exporter:
            file = open(f'data/{dept}.jsonl', 'wb')
            exporter = JsonLinesItemExporter(file)
            exporter.start_exporting()
            self.dept_to_exporter[dept] = (exporter, file)
        return self.dept_to_exporter[dept][0]
