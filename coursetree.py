class Node:
    def __init__(self, code, children=None, x=0, y=0):
        self.code = code
        if children is None:
            self.children = []
        else:
            self.children = children
        self.x = x
        self.y = y

class Tree:
    def __init__(self, root_code):
        self.root = Node(root_code)

    def calculate_positions(self, root_x, root_y, x_unit, y_unit):
        self.ROOT_X = root_x
        self.ROOT_Y = root_y
        self.X_UNIT = x_unit
        self.Y_UNIT = y_unit
        self.position_helper(self.root, 0, 0)

    def position_helper(self, node, left_x, node_y):
        next_x = right_x = left_x
        next_y = node_y - self.Y_UNIT

        for child in node.children:
            right_x = self.position_helper(child, next_x, next_y)
            next_x = right_x + self.X_UNIT

        node_x = left_x + (right_x - left_x) // 2

        node.x = node_x + self.ROOT_X
        node.y = node_y + self.ROOT_Y

        return right_x
