export default class Atomate{
    constructor(str){
        this.setData(str);
    }

    setData(str){
        this.data = str;
        this.states = [];
        this.statesCount = 0;
    }

    findOR(str){
        let bracketsCount = 0;
        for (let i = 0; i < str.length; i++){
            if (str[i] == '(') bracketsCount++;
            if (str[i] == ')') bracketsCount--;
            if (bracketsCount == 0 && str[i] == "|")
                return i;
        }
        return -1;
    }

    areBracketsBalanced(){
        let s = this.data;
        let count = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] == '(') count++;
            if (s[i] == ')') count--;
            if (count < 0) return false;
        }
        return (count == 0);
    }

    getAvailableName(){
        return 'St_' + this.statesCount;
    }

    addState(terminal_0 = [], terminal_1 = [], terminal_e = []){
        this.statesCount++;
        let name = this.getAvailableName();
        this.states.push({
            'name': name,
            '0': terminal_0,
            '1': terminal_1,
            'e': terminal_e
        });
        return name;
    }

    removeState(name){
        let pos = this.findState(name);
        this.states.splice(pos, 1);
    }

    findState(name){
        return this.states.findIndex(v => {
            return v.name == name;
        });
    }

    stateAddNext(name, terminal, next){
        let pos = this.findState(name);
        if (pos == -1) return false;
        this.states[pos][terminal.toString()].push(next);
        return true;
    }

    getAtomata(str, s_end = [{'name': 'Z', 'terminal': 'e'}], isStar = false, shouldRepeatFirst = false){
        if (!str.length) return s_end;

        // ищем 'ИЛИ'
        let pos = this.findOR(str);

        if (pos != -1){
            // 'ИЛИ' внутри строки
            // получение входных и выходных состояний левых и правых частей 'ИЛИ'
            let left = this.getAtomata(str.substr(0, pos), s_end);
            let right = (pos + 1 < str.length) ? this.getAtomata(str.substr(pos + 1), s_end) : s_end;

            // начало может быть null, если это пустая строка ('|10', left.begins === null)
            // тогда можем сразу задать ей конец s_end (это переданное конечное состояние)
            // if (left === null) left = s_end;
            // if (right === null) right = s_end;

            let names = left.concat(right);

            return names;
        }else{
            // нет явного ИЛИ (только внутри скобок, но это отдельно обрабатывается)
            // обработка символа (если не скобка, иначе обработка скобки рекурсивно)

            if (str[0] == '('){
                // поиск закрывающей строки
                let count = 1;
                let positions = -1;
                for (let i = 1; i < str.length && count; i++) {
                    if (str[i] == '('){
                        count++;
                    } else if (str[i] == ')') {
                        count--;
                        if (count == 0) positions = i;
                    }
                }

                let isPlus = false;
                // обработка всего
                let nextsAfterBrackets = s_end;
                if (positions + 1 < str.length) // если после скобок есть что-то
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 1), s_end);
                if (nextsAfterBrackets === true || nextsAfterBrackets === false){
                    // если после скобок звезда или плюсик
                    // то берем то, что после плюсика или звезды
                    if (nextsAfterBrackets)
                        isStar = true;
                    else
                        isPlus = true;
                    nextsAfterBrackets = (str.length > positions + 2) ? this.getAtomata(str.substr(positions + 2), s_end) : s_end;
                }
                if (isStar){
                    // это звезда
                    // тогда надо бы создать вершину
                    // запихнуть её как конец в скобки
                    // и сделать ответвление от неё на них
                    let stateName = this.addState(); // получили имя состояние (зацикливанной вершины)
                    let names = this.getAtomata(str.substr(1, positions - 1), [{'name': stateName, 'terminal': 'e'}]); // зациклили на нашей созданной вершине по Е дуге
                    // окей, надо бы перетащить в эту дугу лишнее состояние
                    let statesToMove = [];
                    this.states.forEach(s => {
                        // бежим по всем состояниям и ищем наше (stateName) среди Е дуг
                        if (s['e'].findIndex(v => {return v == stateName;}) != -1)
                            statesToMove.push(s.name);
                    });
                    // теперь ищем состояния, которые переходят в наши statesToMove
                    // дабы передвинуть их на нашу вершину
                    console.log(statesToMove);
                    this.states.forEach((s, si) => {
                        // бежим по всем состояниям и ищем наше (stateName) среди Е дуг
                        let terminals = ['0', '1', 'e'];
                        terminals.forEach(terminal => {
                            let isStateHaveStatesToMove = s[terminal].findIndex(v => {
                                return (statesToMove.findIndex(v2 => {
                                    return (v2 == v);
                                }) != -1);
                            });
                            if (isStateHaveStatesToMove != -1){
                                // мы знаем что в состоянии 's'
                                // по треминалу 'terminal'
                                // в позиции 'isStateHaveStatesToMove'
                                // находится кто-то из 'stateToMove'
                                // т.е. нам надо заменить текущее состояние (на этой позиции)
                                // на stateName
                                this.states[si][terminal][isStateHaveStatesToMove] = stateName;
                            }
                        });
                    });
                    // после всех наших волшебных преобразований надо удалить из состояний неиспользуемые - stateToMove
                    let newStates = [];
                    this.states.forEach(state => {
                        if (statesToMove.findIndex(s => s == state.name ) == -1)
                            newStates.push(state);
                    });
                    this.states = newStates;
                    
                    nextsAfterBrackets.forEach(brack => {
                        this.stateAddNext(stateName, brack.terminal, brack.name);
                    });
                    names.forEach(n => {
                        this.stateAddNext(stateName, n.terminal, n.name)
                    });


                    return [{
                        'name': stateName,
                        'terminal': 'e'
                    }];
                }
                let names = this.getAtomata(str.substr(1, positions - 1), nextsAfterBrackets);
                return names;
            }else if (str[0] == '1' || str[0] == '0'){
                // если это не все, что выше, то это обычный символ
                let name = this.addState();

                // если мы пришли сюда из скобок
                // то надо бы зациклить себя на себе же
                // if (shouldRepeatFirst) s_end = [{'name': name, 'terminal': str[0]}];

                let nexts = s_end;
                let isPlus = false;
                if (str.length >= 2){
                    nexts = this.getAtomata(str.substr(1), s_end);
                    if (nexts === true || nexts === false){
                        // если следующий элемент - звезда или плюс
                        // заранее узнаем что это, ибо дальше эта переменная меняется
                        if (nexts)
                            isStar = true;
                        else
                            isPlus = true;

                        // а тут берем рекурсию от следующего элемента
                        if (str.length >= 3)
                            nexts = this.getAtomata(str.substr(2), s_end);
                        else
                            nexts = s_end;

                        // а тут мы добавляем возврат на наш текущий элемент
                        // надо же вернуться
                        // nexts = nexts.concat([ {'name': name, 'terminal': str[0]} ]);
                    }
                }

                let currentTerminal = str[0];

                if (isStar || isPlus){
                    // если мы начали с этой строки и у нас флаг
                    // isStar (или isPlus) в тру, то надо в конечный элемент добавить начальный
                    this.stateAddNext(name, str[0], name);
                    
                    if (isStar) currentTerminal = 'e';

                    let name2 = this.addState();
                    nexts.forEach(v => {
                        this.stateAddNext(name2, v.terminal, v.name);
                    });
                    nexts = [{
                        'name': name2,
                        'terminal': 'e'
                    }];
                    s_end.push({'name': name, 'terminal': str[0]});
                }

                nexts.forEach(v => {
                    this.stateAddNext(name, v.terminal, v.name);
                });
                
                return [{'name': name, 'terminal': currentTerminal}];
            }else if (str[0] == '*' || str[0] == '+'){
                // возвращение из getAtomata true свидетельствует о знаке * (false о знаке +), иначе объект
                return (str[0] == '*');
            }else if (str[0] != ')'){
                let er = "Неподдерживаемый символ: " + str[0];
                throw er;
            }
        }
    }

    Do(){
        if (!this.data)
            return "Пустая строка";
        let n = this.data.length;
        let error = null;
        if (!this.areBracketsBalanced())
            return "Скобки не сбалансированы!";

        console.log('____');
        
        this.states.push({
            'name': 'A',
            '0': [],
            '1': [],
            'e': []
        });
        this.states.push({
            'name': 'Z',
            '0': [],
            '1': [],
            'e': []
        });
        try{
            let inputNames = this.getAtomata(this.data);
            inputNames.forEach(v => {
                this.stateAddNext('A', v.terminal, v.name);
            });
        }catch(e){
            error = e;
        }
        return error === null ? this.states : error;
    }
}