transitions = {
    '6': ['5'],
    '8': ['0', '6'],
    '9': ['3', '5'],
    '+': ['-']
}

def is_operator(char):
    return char in "+-="

def transform_expression(expression):
    result = []
    for i, char in enumerate(expression):
        if char in transitions and not is_operator(char):
            for new_char in transitions[char]:
                new_expression = expression[:i] + new_char + expression[i+1:]
                result.append(new_expression)
    return result

def evaluate_expression(expression):
    try:
        # Простий спосіб обчислення виразу
        return eval(expression)
    except:
        # Якщо вираз не може бути обчислений
        return False

def is_valid_expression(expression):
    # Розділяємо вираз на частини за знаком '='
    parts = expression.split('=')
    if len(parts) == 2 and evaluate_expression(parts[0]) == evaluate_expression(parts[1]):
        return True
    return False

def find_valid_transformations(expression):
    valid_expressions = []
    for transformed_expression in transform_expression(expression):
        if is_valid_expression(transformed_expression):
            valid_expressions.append(transformed_expression)
    return valid_expressions
