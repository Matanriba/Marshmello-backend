const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const logger = require('../../services/logger.service')


async function query(filterBy) {
    try {
        // console.log('Filter from backend service: ', filterBy)
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('board')
        const boards = await collection.find(criteria).toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }

}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = collection.findOne({ '_id': ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`Error while finding board ${boardId}`, err)
        throw err
    }
}

async function update(board) {
    try {
        let boardId = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ "_id": boardId }, { $set: { ...board } })
    } catch (err) {
        logger.error(`cannot update board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('board')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(boardId) }
        if (!isAdmin) criteria.byUserId = ObjectId(userId)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}


async function add(board) {
    try {
        // peek only updatable fields!
        const boardToSave = {
            title: board.title,
            createdAt: Date.now(),
            style: (board.style) ? board.style : {},
            isStarred: false,
            createdBy: board.createdBy,
            groups: [],
            labels: [{
                id: "l101",
                title: "",
                color: "#61bd4f"
            },
            {
                id: "l102",
                title: "",
                color: "#FF9F1A"
            },
            {
                id: "l103",
                title: "",
                color: "#eb5a46"
            },
            {
                id: "l104",
                title: "",
                color: "#C377E0"
            },
            {
                id: "l105",
                title: "",
                color: "#344563"
            },
            {
                id: "l106",
                title: "",
                color: "#FF78CB"
            }
            ],
            members: [board.createdBy],
            activities: []
        }
        console.log('Board from server: ', boardToSave)
        const collection = await dbService.getCollection('board')
        await collection.insertOne(boardToSave)
        return boardToSave
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    getById,
    update
}


