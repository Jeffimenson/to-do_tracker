import { intervalToDuration, differenceInDays, compareAsc } from "date-fns";

function getDaysOld(date){ //To be used to check if completed tasks and quests are older than 2 days
    const today = new Date();
    const comp = compareAsc(date, today);
    if (comp < 0) {
        const result = differenceInDays(today, date);
        if (result === -0) return 0; 
        return result;
    } else {
        const result = differenceInDays(today, date);
        return (result + 1) * -1;
    }
}

function getDaysOldV2(date) {
    const today = new Date();
    const dueInFuture = quest.dueDate > today;
    const timeDiff = intervalToDuration({
        start: quest.dueDate,
        end: today
    });


    return (dueInFuture)? timeDiff.days : - timeDiff.days;
}

class Task {
    description;
    isOptional;
    #completionDate = null;
    constructor (description, isOptional){
        this.description = description;
        this.isOptional = isOptional;
    }

    get completionDate (){
        return this.#completionDate;
    }

    get isComplete () {
        return this.#completionDate !== null;
    }

    complete(){
        this.#completionDate = new Date();
    }

    resetCompletion(){
        this.#completionDate = null;
    }

    beenCompleted(){
        return getDaysOld(this.#completionDate) > 2; 
    }
}

class Quest {
    name; 

    dueDate;
    #completionDate = null;
    get completionDate (){
        return this.#completionDate;
    }


    tasks = [];

    get completedTasks (){
        const completed = [];
        for (let i = 0; i < this.tasks.length; i++){
            const task = this.tasks[i];
            if (task.completionDate !== null){
                completed.push(task);
            }
        }
        return completed;
    }

    get isComplete () {
        return this.#completionDate !== null;
    }

    get isOverdue() {
        return this.dueDate < new Date();
    }

    constructor (name, tasks=[], dueDate=null){
        this.name = name; 
        this.tasks = tasks;
        this.dueDate = dueDate;
    }

    complete(){
        this.#completionDate = new Date(); 
    }

    resetCompletion(){
        this.#completionDate = null;
    }

    resetTasks(){
        for (let i = 0; i < this.tasks.length; i++){
            if (task.completionDate !== null){
                this.decompleteTask(i);
            }
        }
    }

    removeTask(index){
        this.tasks.splice(index, 1);
    } 

    addTask(task){
        if (this.shouldBeComplete()) {
            this.resetCompletion();
        }
        this.tasks.push(task);
    }

    moveTask(fromIndex, toIndex){
        const task = this.tasks[fromIndex];
        this.removeTask(fromIndex);
        this.tasks.splice(toIndex, 0, task);
    }

    completeTask(index){
        const task = this.tasks[index];
        task.trackCompletionDate();
    }
    
    decompleteTask(index){
        const task = this.tasks[index];
        this.#completionDate = null;
    }
    
    shouldBeComplete(){
        return this.tasks.length === this.completedTasks.length;
    }

    trackCompletionDate(){
        this.#completionDate = new Date();
    }
    
    beenCompleted(){
        return getDaysOld(this.#completionDate) > 2; 
    }
}

class QuestGroup {
    #quests = [];
    
    get quests () {
        return this.#quests;
    }

    constructor(quests) {
        if (quests) {
            this.#quests = quests;
        }
    }

    get quests (){
        return this.#quests;
    }

    get completedQuests (){
        const completed = [];
        for (quest of this.#quests){
            if (quest.completionDate !== null){
                completed.push(quest);
            }
        }
        return completed;
    }
    
    addQuest(newQuest){
        console.log(this.#quests);
        this.#quests.unshift(newQuest);
    }

    removeQuest(index){
        this.#quests.splice(index, 1);
    }

    moveQuest(fromIndex, toIndex){
        const quest = this.#quests[fromIndex];
        this.removeQuest(fromIndex);
        this.#quests.splice(toIndex, 0, quest);
    }

    // swapQuests(i1, i2){
    //     const temp = this.#quests[i1];
    //     this.#quests[i1] = this.#quests[i2];
    //     this.#quests[i2] = temp;
    // }

    getQuest(index){
        return this.#quests[index];
    }

    completeQuest(index){
        const quest = this.#quests[index];
        quest.complete();
    }
    
    cleanCompleted(){
        for (let i = 0; i < this.completedQuests.length; i++){
            const quest = this.completedQuests[i];
            if (quest.beenCompleted()){
                const quesInd = this.#quests.indexOf(quest);
                this.removeQuest(quesInd);
                i--;
            }
        }
    }

    // checkIfQuestDue(quest) {
    //     const today = new Date();
    //     return quest.dueDate < today;
    // }
}


function DailyTime(hour, minute){
    return {
        hour, 
        minute
    };
}

const Day = {
    Sun: 0,
    Mon: 1,
    Tue: 2, 
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
};

function WeeklyTime(day, hour, minute){
    return {
        day, 
        hour,
        minute
    };
}

class StaticQuestGroup extends QuestGroup {
    QGType = "stat";

    makeQuest(name, tasks, due){
        const qst = new Quest(name, tasks, due);
        this.addQuest(qst);

        return qst;
    }
}

class DailyQuestGroup extends QuestGroup {
    QGType = "daily";

    makeQuest(name, tasks, time){
        const date = new Date();
        date.setHours(time.hour, time.minute, 0);

        const qst = new Quest(name, tasks, date);
        this.addQuest(qst);
    }

    resetQuests(){
        for (let i = 0; i < this.quests.length; i++){
            const currQuest = this.getQuest(i);
            const dueTime = currQuest.dueDate;
            const newTime = new Date();
            newTime.setHours(dueTime.getHours(), dueTime.getMinutes(), 0);

            currQuest.dueDate = newTime;

            if (currQuest.completionDate !== null) {
                currQuest.resetCompletion();
                currQuest.resetTasks();
            }
        }
    }
}

class WeeklyQuestGroup extends QuestGroup {
    QGType = "weekly";

    makeQuest(name, tasks, weeklyTime) {
        const date = new Date();
        const dayDiff = date.getDay() - weeklyTime.day; 

        const dayOfMonth = date.getDate() - dayDiff; 
        date.setDate(dayOfMonth);

        date.setHours(weeklyTime.hour, weeklyTime.minute, 0);
        
        const qst = new Quest(name, tasks, date);
        this.addQuest(qst);
    }

    resetQuests() {
        for (let i = 0; i < this.quests.length; i++){
            const currQuest = this.getQuest(i);
            const dueDate = currQuest.dueDate;

            const newDate = new Date();
            const dayDiff = newDate.getDay() - dueDate.getDay();
            const newDayOfMonth = newDate.getDate() - dayDiff;
            newDate.setDate(newDayOfMonth);
            newDate.setHours(dueDate.getHours(), dueDate.getMinutes(), 0);

            currQuest.dueDate = newDate;


            if (currQuest.completionDate !== null) {
                currQuest.resetCompletion();
                currQuest.resetTasks();
            }
            
        }
    }
}

export {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime};