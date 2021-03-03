class Node:
    def __init__(self, code, children=[], x=0, y=0):
        self.code = code
        self.children = children
        self.x = x
        self.y = y

class Tree:
    X_UNIT = 50
    Y_UNIT = 100

    def __init__(self, root_code):
        self.root = Node(root_code)

    def calculate_positions(self, root_x, root_y):
        self.position_helper(self.root, 0, 0, root_x, root_y)

    def position_helper(self, node, left_x, node_y, root_x, root_y):
        next_x = right_x = left_x
        next_y = node_y - self.Y_UNIT

        for child in node.children:
            right_x = self.position_helper(child, next_x, next_y, root_x, root_y)
            next_x = right_x + self.X_UNIT

        node_x = left_x + (right_x - left_x) // 2

        node.x = node_x + root_x
        node.y = node_y + root_y

        return right_x
