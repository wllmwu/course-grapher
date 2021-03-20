class Node:
    def __init__(self, code, group, children=None, same_as_sib=False, x=0, y=0):
        self.code = code
        self.group = group
        if children is None:
            self.children = []
        else:
            self.children = children
        self.same_as_sibling = same_as_sib
        self.x = x
        self.y = y

class Tree:
    def __init__(self, root_code):
        self.root = Node(root_code, 0)

    def calculate_positions(self, root_x, root_y, x_unit, y_unit):
        #self.ROOT_X = root_x
        #self.ROOT_Y = root_y
        self.X_UNIT = x_unit
        self.Y_UNIT = y_unit

        self.root.x = root_x
        self.root.y = root_y
        self.position_helper(self.root, 0, [root_y])

    def position_helper(self, node, level, prev_y_coords):
        if level < len(prev_y_coords):
            node.y = max(node.y, prev_y_coords[level] + self.Y_UNIT)
        else:
            prev_y_coords.append(node.y)

        if len(node.children) > 0:
            child_start_y = node.y - (len(node.children) // 2 * self.Y_UNIT)
            if level + 1 < len(prev_y_coords):
                child_start_y = max(child_start_y,
                                    prev_y_coords[level + 1] + self.Y_UNIT)
            for i in range(len(node.children)):
                child = node.children[i]
                child.x = node.x - self.X_UNIT
                child.y = child_start_y + i * self.Y_UNIT
                self.position_helper(child, level + 1, prev_y_coords)

            first_child_y = node.children[0].y
            last_child_y = node.children[-1].y
            node.y = first_child_y + (last_child_y - first_child_y) // 2

        prev_y_coords[level] = node.y

'''
    def position_helper(self, node, node_x, start_y):
        next_x = node_x - self.X_UNIT
        next_y = last_y = start_y

        for i, child in enumerate(node.children):
            if i > 0 and child.same_as_sibling:
                prev_child = node.children[i - 1]
                child.x = prev_child.x
                child.y = prev_child.y + self.Y_UNIT
                if child.y > last_y:
                    last_y = child.y
            else:
                last_y = self.position_helper(child, next_x, next_y)

            next_y = last_y + self.Y_UNIT

        node_y = start_y + (last_y - start_y) // 2

        node.x = node_x + self.ROOT_X
        node.y = node_y

        return last_y

    def minimize_gaps(self, node, prev_y_coords, level):
        min_gap = self.find_min_gap(node, prev_y_coords, level, 2 ** 31)
        #

    def find_min_gap(self, node, prev_y_coords, level, curr_min):
        if level >= len(prev_y_coords):
            return curr_min

        diff_y = node.y - prev_y_coords[level]
        if diff_y < curr_min:
            curr_min = diff_y

        if len(node.children) == 0:
            return curr_min
        return self.find_min_gap(node.children[0], prev_y_coords, level + 1,
                                 curr_min)
'''
