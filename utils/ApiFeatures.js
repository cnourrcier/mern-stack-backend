class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        // create shallow copy of this.queryStr
        const queryCopy = { ...this.queryStr };

        // remove fields from the query
        const removeFields = ['sort', 'fields', 'limit', 'page'];
        removeFields.forEach(el => delete queryCopy[el]);

        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObj = JSON.parse(queryString);
        this.query = this.query.find(queryObj);
        // must return an instance of the ApiFeatures class in order to chain other methods from ApiFeatures.
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // using '-' excludes field rating from response.
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        // multiplying by 1 converts String to Number type.
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 10;
        // PAGE 1: 1 - 10; PAGE 2: 11 - 20; PAGE 3: 21 - 30
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        // if (this.queryStr.page) {
        //     const todosCount = await Todo.countDocuments();
        //     if (skip >= todosCount) {
        //         throw new Error("This page is not found!");
        //     }
        return this;
    }
}

module.exports = ApiFeatures;