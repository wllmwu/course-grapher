class Node:
    def __init__(self, code, group, single, children=None, same_as_sib=False,
                 x=0, y=0):
        self.code = code
        self.group = group
        self.single = single
        if children is None:
            self.children = []
        else:
            self.children = children
        self.same_as_sibling = same_as_sib
        self.x = x
        self.y = y

class Tree:
    def __init__(self, root_code):
        self.root = Node(root_code, 0, True)

    def calculate_positions(self, root_x, root_y, x_unit, y_unit):
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
