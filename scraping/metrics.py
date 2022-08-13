class ScrapingMetrics:
    def __init__(self):
        super().__init__()
        self.metrics = {
            'departments': 0,
            'courses': 0,
            'code_match_failures': 0,
            'ignored_crosslistings': 0,
            'missing_units': 0,
        }

    def set_departments(self, n):
        self.metrics['departments'] = n

    def add_courses(self, n):
        self.metrics['courses'] += n

    def inc_code_match_failures(self):
        self.metrics['code_match_failures'] += 1

    def inc_ignored_crosslistings(self):
        self.metrics['ignored_crosslistings'] += 1

    def inc_missing_units(self):
        self.metrics['missing_units'] += 1

    def get_departments(self):
        return self.metrics['departments']

    def get_courses(self):
        return self.metrics['courses']

    def get_code_match_failures(self):
        return self.metrics['code_match_failures']

    def get_ignored_crosslistings(self):
        return self.metrics['ignored_crosslistings']

    def get_missing_units(self):
        return self.metrics['missing_units']

    def pretty_print(self):
        print('Scraping statistics:')
        print('Found %d departments, %d courses.' %
              (self.get_departments(), self.get_courses()))
        print('%d courses were crosslisted (instances besides the first were skipped).' %
              self.get_ignored_crosslistings())
        print('Failed to parse course code %d times.' %
              self.get_code_match_failures())
        print('Unit count was missing %d times.' % self.get_missing_units())
