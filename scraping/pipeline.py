from io import BufferedWriter
from itemadapter import ItemAdapter
from scrapy.exporters import JsonLinesItemExporter


ExporterMap = dict[str, tuple[JsonLinesItemExporter, BufferedWriter]]


class PerDepartmentExportPipeline:
    """
    Exports course data to JSON-Lines files according to department. For
    example, a course item with `'dept': 'CSE'` will be written to
    `data/CSE.jsonl`.

    Based on this example from the Scrapy docs:
    https://docs.scrapy.org/en/latest/topics/exporters.html#using-item-exporters
    """

    def open_spider(self, spider):
        self.dept_to_exporter: ExporterMap = {}

    def close_spider(self, spider):
        for exporter, file in self.dept_to_exporter.values():
            exporter.finish_exporting()
            file.close()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        exporter = self._exporter_for_item(adapter)
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
