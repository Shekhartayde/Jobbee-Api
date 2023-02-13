const express=require('express')
const { getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob, jobStats } = require('../controllers/jobsController')
const { isAuthenticatedUser,authorizeRoles } = require('../middlewares/auth')


const router=express.Router()

router.route('/jobs').get(getJobs)
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius)
router.route('/job/new').post(isAuthenticatedUser,authorizeRoles('employer','admin'),newJob)
router.route('/job/:id').put(isAuthenticatedUser,updateJob)
router.route('/job/:id').delete(isAuthenticatedUser,deleteJob)
router.route('/job/:id/:slug').get(getJob)
router.route('/stats/:topic').get(jobStats)

module.exports=router

isAuthenticatedUser

