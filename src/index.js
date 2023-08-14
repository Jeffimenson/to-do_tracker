import './style.css';
import {make, query, Factory} from './jeffQuery.js';

const body = query('body');
const div = make('div', body);
div.textContent = "hello world";


class Task {
    description;
    isOptional;
    #completionDate = null;
    constructor (description, isOptional){
        this.description = description;
        this.isOptional = isOptional;
    }

    trackCompletionDate(){
        this.#completionDate = "TODAY'S DATE";
    }

}


class Quest {
    name; 

    dueDate;
    #completionDate;

    #tasks = [];
    #completedTasks = [];

    constructor (name, tasks=[], dueDate=null){
        this.name = name; 
        this.#tasks = tasks;
        this.dueDate = dueDate;
    }

    removeTask(index){
        this.#tasks.splice(index, 1);
    } 

    addTask(task){
        this.#tasks.unshift(task);
    }

    completeTask(index){
        const task = this.#tasks[index];
        task.trackCompletionDate();
        this.#completedTasks.unshift(task);
        this.removeTask(index);
    }
    
    shouldBeComplete(){
        return this.#tasks.length === 0 && this.#completedTasks > 0;
    }
    trackCompletionDate(){
        this.#completionDate = "TODAY'S DATE";
    }
}

class QuestGroup {
    #quests = [];
    #completedQuests = []; 

    constructor(){}
    
    addQuest(name, tasks){
        const newQuest = new Quest(name, tasks);
        this.#quests.push(newQuest);
    }

    removeQuest(index){
        this.#quests.splice(index, 1);
    }

    swapQuests(i1, i2){
        const temp = this.#quests[i1];
        this.#quests[i1] = this.#quests[i2];
        this.#quests[i2] = temp;
    }

    getQuest(index){
        return this.#quests[index];
    }

    completeQuest(index){
        const quest = this.#quests[index];
        quest.trackCompletionDate();
        this.#completedQuests.push(quest);
        this.removeQuest(index);
    }
    
}

const testGroup = new QuestGroup();
const tasks = [];
for (let i = 0; i < 10; i++){
    const newTask = new Task("Activate lever " + i, false);
    tasks.push(newTask);
}
const testQuest = new Quest("Lever mania", tasks);
testGroup.addQuest(testQuest);
testGroup.removeQuest(0);
console.log(testGroup);