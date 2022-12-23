class ScrapingMetrics:
    def __init__(self):
        super().__init__()
        self.metrics = {
            'departments': 0,
            'courses': 0,
            'sequence_listings': 0,
            'code_match_failures': 0,
            'ignored_crosslistings': 0,
            'missing_units': 0,
            'missing_anchors': 0,
            'missing_descriptions': 0,
            'with_prerequisites': 0,
            'with_corequisites': 0,
            'with_successors': 0
        }

    def set_departments(self, n):
        self.metrics['departments'] = n

    def add_courses(self, n):
        self.metrics['courses'] += n

    def inc_sequence_listings(self):
        self.metrics['sequence_listings'] += 1

    def inc_code_match_failures(self):
        self.metrics['code_match_failures'] += 1

    def inc_ignored_crosslistings(self):
        self.metrics['ignored_crosslistings'] += 1

    def inc_missing_units(self):
        self.metrics['missing_units'] += 1

    def inc_missing_anchors(self):
        self.metrics['missing_anchors'] += 1

    def inc_missing_descriptions(self):
        self.metrics['missing_descriptions'] += 1

    def inc_with_prerequisites(self):
        self.metrics['with_prerequisites'] += 1

    def inc_with_corequisites(self):
        self.metrics['with_corequisites'] += 1

    def inc_with_successors(self):
        self.metrics['with_successors'] += 1

    def get_departments(self):
        return self.metrics['departments']

    def get_courses(self):
        return self.metrics['courses']

    def get_sequence_listings(self):
        return self.metrics['sequence_listings']

    def get_code_match_failures(self):
        return self.metrics['code_match_failures']

    def get_ignored_crosslistings(self):
        return self.metrics['ignored_crosslistings']

    def get_missing_units(self):
        return self.metrics['missing_units']

    def get_missing_anchors(self):
        return self.metrics['missing_anchors']

    def get_missing_descriptions(self):
        return self.metrics['missing_descriptions']

    def get_with_prerequisites(self):
        return self.metrics['with_prerequisites']

    def get_with_corequisites(self):
        return self.metrics['with_corequisites']

    def get_with_successors(self):
        return self.metrics['with_successors']

    def pretty_print(self):
        print('Scraping statistics:')
        print('Found %d departments, %d courses.' %
              (self.get_departments(), self.get_courses()))
        print('%d courses were crosslisted (instances besides the first were skipped).' %
              self.get_ignored_crosslistings())
        print('%d courses were sequence listings.' %
              self.get_sequence_listings())
        print('Failed to parse course code %d times.' %
              self.get_code_match_failures())
        print('Unit count was missing %d times.' % self.get_missing_units())
        print('Anchor tag was missing %d times' % self.get_missing_anchors())
        print('Failed to find a description for %d courses' %
              self.get_missing_descriptions())
        print('%d courses had prerequisites' % self.get_with_prerequisites())
        print('%d courses had corequisites' % self.get_with_corequisites())
        print('%d courses had successors' % self.get_with_successors())
