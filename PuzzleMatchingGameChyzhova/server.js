//server.js

const express = require('express');
const app = express();
const port = 3000;
const pl = require('tau-prolog');
require("tau-prolog/modules/lists")(pl);

app.use(express.static('public'));
app.use(express.json());

app.post('/solve', (req, res) => {
    const equation = req.body.equation;
    const prologInput = convertEquationToPrologList(equation);

    // Створення сесії Tau Prolog
    let session = pl.create();
    // Програма Prolog
    let program = `
:- use_module(library(lists)).


transition(6, 5).
transition(7, 1).
transition(8, 0).
transition(8, 6).
transition(8, 9).
transition(9, 3).
transition(9, 5).
transition(+, -).


transformation([], []):-!.
transformation([H|T], [L|Changes]):-
    findall(Res, transition(H, Res), L),
    transformation(T, Changes).

transform_inverse([], []):-!.
transform_inverse([H|T], [L|Changes]):-
    findall(Res, transition(Res, H), L),
    transform_inverse(T, Changes).


list_in_expression([0|[_|_]], 0, ['false']):-!.
list_in_expression([], 0, []):-!.
is_operator(H) :- H == '+'. 
is_operator(H) :- H == '-'. 
is_operator(H) :- H == '='.

list_in_expression([H|T], 0, [H|Res]) :-
    is_operator(H),
    list_in_expression(T, _, Res), !.

list_in_expression([H|T], Count, Res):-
    list_in_expression(T, Count1, R),
    ((Count1 =:= 0, list_in_expression_0(H,R,Res));(Count1 > 0,list_in_expression_1(H,R,Count1,Res))),
    Count is Count1 +1,!.
list_in_expression_0(H,R, [H|R]):-!.
list_in_expression_1(H, [H1|T1],Count, [ResN|T1]):-
    power10(Count, Powered),
    ResN is H*Powered + H1,!.

power10(1,10):-!.
power10(Power, Res) :-
    Power1 is Power - 1,
    power10(Power1, Res1),
    Res is 10*Res1.


h(L,R):- findall(Lists, (append(L1,[Y|L2],L),length(Y, F), F>0, empty(L1,R1),empty(L2,R2), member(X,Y),append(R1,[[X]|R2], Lists)),R),!.

empty([],[]):-!.
empty([_|T], [[]|R]):- empty(T, R).

transform_expression([], [], []).
transform_expression([H|T], [[]|T1], [H|R]):-
    transform_expression(T, T1, R),!.
transform_expression([_|T], [[Ch]|T1], [Ch|R]):-
    transform_expression(T, T1, R).

arifm([N1,=,N1]):-!.
arifm([N1|['-'|[N2|T]]]):-
    R is N1-N2,
    arifm([R|T]),!.
arifm([N1|['+'|[N2|T]]]):-
    R is N1+N2,
    arifm([R|T]).

x(L, Ch, R):-
    h(Ch, F),
    member(X,F),
    transform_expression(L, X, Res),
    list_in_expression(Res, _, R).

solution(L,R):-
    transformation(L, Ch),
    x(L, Ch, R),
    append(_,[E],R),
    \\+ (E=='false'),
    arifm(R).
generator(R,G):-
    transform_inverse(R, Ch2),
    x(R, Ch2, G),
    append(_,[E],G),
    \\+ (E=='false').

game(L,Res,Gen):-
    findall(R, solution(L,R), Res),
    findall(G, (member(R,Res),generator(R,G)), Gen),!.
`;
    
    session.consult(program, {
        success: function() {
            // Запит
            let query = `game([${prologInput}], Res, Gen).`;
            session.query(query, {
                success: function(goal) {
                    // Отримання відповіді
                    session.answer({
                        success: function(answer) {
                            // Використання форматування відповіді
                            let formattedSolution = parsePrologOutput(session.format_answer(answer));
                            res.json(formattedSolution);
                        },
                        fail: function() {
                            res.json({solution: "No solution found."});
                        },
                        error: function(err) {
                            console.error(err);
                            res.status(500).json({error: "Prolog execution error."});
                        }
                    });
                },
                error: function(err) {
                    console.error(err);
                    res.status(500).json({error: "Query error."});
                }
            });
        },
        error: function(err) {
            console.error(err);
            res.status(500).json({error: "Consult error."});
        }
    });
});

function convertEquationToPrologList(equation) {
    return equation.split('').map(c => isNaN(parseInt(c)) ? `'${c}'` : c).join(', ');
}

function parsePrologOutput(stdout) {
    // Перетворюємо вивід Prolog у зручний для читання формат
    // Цей код потрібно адаптувати залежно від точного формату виводу Prolog
    const lines = stdout.split('\n').filter(line => line.trim() !== '');
    const resPattern = /Res = (.+).$/;
    const genPattern = /Gen = (.+).$/;
    let resMatch = lines.find(line => resPattern.test(line));
    let genMatch = lines.find(line => genPattern.test(line));

    let resOutput = resMatch ? formatPrologList(resMatch.match(resPattern)[1].split(" Gen = ")[0]) : 'Рішення не знайдено';
    let genOutput = genMatch ? formatPrologList(genMatch.match(genPattern)[1]) : 'Додаткові рішення не знайдені';

    return { solution: resOutput, additionalSolution: genOutput };
}

function formatPrologList(prologList) {
    // Перетворює список Prolog у рядок для відображення
    // Видаляємо зайві символи для чистого виводу
    let formattedString = prologList
        .replace(/\[\[/g, '') // Видаляємо подвійні відкриваючі квадратні дужки
        .replace(/\]\]/g, '') // Видаляємо подвійні закриваючі квадратні дужки
        .replace(/\],\s*\[/g, '; ') // Заміняємо ], [ на "; "
        .replace(/\[|\]/g, '') // Видаляємо всі одинарні квадратні дужки
        .replace(/,/g, ' '); // Заміняємо коми на пробіли для кращого читання

    return formattedString;
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
