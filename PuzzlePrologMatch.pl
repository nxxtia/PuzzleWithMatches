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
list_in_expression([H|T], 0, [H|Res]):-
    (H=='+';H=='-';H=='='),
    list_in_expression(T, _, Res),!.
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
    not(E=='false'),
    arifm(R).
generator(R,G):-
    transform_inverse(R, Ch2),
    x(R, Ch2, G),
    append(_,[E],G),
    not(E=='false').

game(L,Res,Gen):-
    findall(R, solution(L,R), Res),
    findall(G, (member(R,Res),generator(R,G)), Gen),!.

/** <examples>
?- (game([8, +, 1, =, 8], Res, Gen)).
Gen = [[8, +, 7, =, 9], [8, +, 1, =, 8]],
Res = [[8, +, 1, =, 9]] 

?- (game([6, +, 1, =, 6], Res, Gen)).
Gen = [[6, +, 1, =, 6], [9, +, 1, =, 6], [5, +, 7, =, 6], [5, +, 1, =, 8]],
Res = [[5, +, 1, =, 6]]
*/


