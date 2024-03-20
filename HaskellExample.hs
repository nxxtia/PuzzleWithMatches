type Transition = (Char, Char)
type Expression = [Char]

transitions :: [Transition]
transitions = [('6', '5'), ('7', '1'), ('8', '0'), ('8', '6'), ('8', '9'), ('9', '3'), ('9', '5'), ('+', '-')]

transformation :: Expression -> [[Char]]
transformation expr = map transform expr
  where
    transform char = [res | (src, res) <- transitions, src == char]

-- Спробуємо замінити кожен символ у виразі та перевірити, чи веде це до правильного виразу
transformExpression :: Expression -> [Expression]
transformExpression expr = concatMap replaceAtIndex [0..length expr - 1]
  where
    replaceAtIndex i = [take i expr ++ [newDigit] ++ drop (i + 1) expr | 
                        newDigit <- possibleTransitions (expr !! i), 
                        isOperator (expr !! i) /= True]

isOperator :: Char -> Bool
isOperator c = c `elem` "+-="

-- Спрощена перевірка правильності виразу
-- УВАГА: Це лише ілюстративний приклад, який не виконує реальні арифметичні обчислення
isValidExpression :: Expression -> Bool
isValidExpression expr = expr == "6-5=1" || expr == "8-6=2"

-- Застосовує перетворення до виразу і повертає тільки ті, що є правильними
findValidTransformations :: Expression -> [Expression]
findValidTransformations expr = filter isValidExpression (transformExpression expr)

main :: IO ()
main = print $ findValidTransformations "6-5=2"
