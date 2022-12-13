from io import BufferedWriter
from itemadapter import ItemAdapter
from scrapy.exporters import JsonLinesItemExporter


ExporterMap = dict[str, tuple[JsonLinesItemExporter, BufferedWriter]]


class PerDepartmentExportPipeline:
    """
    Exports course data to JSON Lines files. An item with `'file': 'XX'` is
    written to `data/XX.jsonl`, without the `file` field.

    Based on this example from the Scrapy docs:
    https://docs.scrapy.org/en/latest/topics/exporters.html#using-item-exporters
    """

    def open_spider(self, spider):
        self.exporter_map: ExporterMap = {}

    def close_spider(self, spider):
        for exporter, file in self.exporter_map.values():
            exporter.finish_exporting()
            file.close()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        exporter = self._exporter_for_item(adapter)
        del item['file']
        exporter.export_item(item)
        return item

    def _exporter_for_item(self, item):
        filename = item['file']
        if filename not in self.exporter_map:
            file = open(f'intermediate/{filename}.jsonl', 'wb')
            exporter = JsonLinesItemExporter(file)
            exporter.start_exporting()
            self.exporter_map[filename] = (exporter, file)
        return self.exporter_map[filename][0]
