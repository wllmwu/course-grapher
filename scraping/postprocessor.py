import logging
import os


class Postprocessor:
    def __init__(self) -> None:
        super().__init__()
        self.logger = logging.getLogger('postprocessor')

    def run(self) -> None:
        self.logger.info('Starting postprocessing step')
        with os.scandir('data') as iterator:
            for entry in iterator:
                if entry.is_file() and entry.name.endswith('.jsonl'):
                    print(entry.name)
