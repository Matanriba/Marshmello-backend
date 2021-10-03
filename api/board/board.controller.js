const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const boardService = require('./board.service')
const { ObjectId } = require('bson')
const queryString = require('query-string');
const { Admin } = require('mongodb')

// LIST
async function getBoards(req, res) {
    try {
        const boards = await boardService.query()
        res.send(boards)
    } catch (err) {
        logger.error('Cannot get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

//GET BY ID
async function getBoardById(req, res) {
    try {
        const { boardId } = req.params
        console.log('request.params: ', req.query)
        const filterBy = req.query['0']
        const parsed = queryString.parse(filterBy, { arrayFormat: 'separator', arrayFormatSeparator: ',' });
        const board = await boardService.getById(boardId, parsed)
        res.json(board)
    } catch (err) {
        logger.error('Failed to get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}

//GET DASHBOARD DATA
async function getDashboardData(req, res) {
    try {
        const { boardId } = req.params
        const chartsData = await boardService.getDashboardData(boardId)
        res.json(chartsData)
    } catch (err) {
        logger.error('Failed to get dashboard data', err)

    }
}

// UPDATE 
async function updateBoard(req, res) {
    try {
        const { board, activity } = req.body
        if (activity) {
            const newActivity = {
                    txt: activity.txt,
                    byMember: activity.byMember,
                    createdAt: Date.now(),
                    card: (activity.card) ? { id: activity.card.id, title: activity.card.title } : {},
                    groupId: (activity.groupId) ? activity.groupId : null
                }
                // console.log('Activity from service: ', newActivity)
            board.activities.unshift(newActivity)
                // console.log('Board activities from service: ', board.activities)
        }
        const updatedBoard = await boardService.update(board)
        res.json(updatedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}

// ADD
async function addBoard(req, res) {
    try {
        const board = req.body
        const addedBoard = await boardService.add(board)

        // console.log('CTRL SessionId:', req.sessionID);
        // socketService.broadcast({type: 'board-added', data: board, userId: board.byUserId})
        // socketService.emitToUser({type: 'board-about-you', data: board, userId: board.aboutUserId})
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.json(addedBoard)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }
}

// REMOVE
async function deleteBoard(req, res) {
    try {
        await boardService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete board', err)
        res.status(500).send({ err: 'Failed to delete board' })
    }
}

module.exports = {
    getBoards,
    deleteBoard,
    addBoard,
    getBoardById,
    updateBoard,
    getDashboardData
}