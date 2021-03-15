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
        self.ROOT_X = root_x
        self.ROOT_Y = root_y
        self.X_UNIT = x_unit
        self.Y_UNIT = y_unit
        self.position_helper(self.root, 0, 0)

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
        node.y = node_y + self.ROOT_Y

        return last_y

    '''
    def position_helper(self, node, left_x, node_y):
        next_x = right_x = left_x
        next_y = node_y - self.Y_UNIT

        for i, child in enumerate(node.children):
            if i > 0 and child.same_as_sibling:
                prev_child = node.children[i - 1]
                child.x = prev_child.x + self.X_UNIT
                child.y = prev_child.y
                if child.x > right_x:
                    right_x = child.x
            else:
                right_x = self.position_helper(child, next_x, next_y)
            next_x = right_x + self.X_UNIT

        node_x = left_x + (right_x - left_x) // 2

        node.x = node_x + self.ROOT_X
        node.y = node_y + self.ROOT_Y

        return right_x
    '''
