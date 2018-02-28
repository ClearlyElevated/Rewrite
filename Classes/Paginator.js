class Paginator {
    // new Paginator(["item1", "item2", "item3", "item4"], 2)
    // [
    //  [ [0, "item1"], [1, "item2"] ],
    //  [ [2, "item3"], [2, "item4"] ]
    // ]
    constructor(array, perPage = 10) {
        let pages = [];
        for (let i = 0; i < array.length; i++) {
            let index = Math.floor(i / perPage);
            if (!pages[index]) pages[index] = [];
            pages[index].push([i, array[i]]);
        }
        this.pages = pages;
        this.pageCount = pages.length;
    }

    getPage(page = 1) {
        return this.pages[page - 1] || this.pages[0] || [];
    }

    loopPage(p = 0, action = () => {}) {
        const page = this.getPage(p);
        for (let i = 0; i < page.length; i++) {
            const index = page[i][0];
            const item = page[i][1];
            action(index, item);
        }
    }
}

module.exports = Paginator;