const Job=require('../models/jobs')
const geoCoder=require('../utils/geocoder')
const ErrorHandler=require('../utils/errorHandler')
const catchAsyncErrors=require('../middlewares/catchAsyncErrors')
const APIFilters =require('../utils/apiFilters')


//Get all jobs => /api/v1/jobs
exports.getJobs=catchAsyncErrors(async(req,res,next)=>{
    const apiFilters = new APIFilters(Job.find(),req.query)
    .filter()
    .sort()
    .limitfields()
    .searchByQuery()
    .pagination()

    const jobs=await apiFilters.query
    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs
    })
})

//creat a new job = /api/v1/jobs/new

exports.newJob=catchAsyncErrors (async (req,res,next)=>{

    //adding user to body
    req.body.user=req.user.id

    const job=await Job.create(req.body)

    res.status(200).json({
        success:true,
        message:'Job Created',
        data:job
    })
})

// Update a job ==>  /api/v1/job/:id

exports.updateJob=catchAsyncErrors(async (req,res,next)=>{
    const id=req.params.id

    let job=await Job.findById(id)

    if(!job){
        return next(new ErrorHandler('Job Not Found.',404))
    }
    job=await Job.findByIdAndUpdate(id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    return res.status(200).json({
        success:true,
        message:"Job is updated",
        data:job
    })
})

//Delete a job ==>  /api/v1/job/:id

exports.deleteJob=catchAsyncErrors(async(req,res,next)=>{
    let job=await Job.findById(req.params.id)

    if(!job){
        return next(new ErrorHandler('Job Not Found.',404))
    }
    job=await Job.findByIdAndDelete(req.params.id)
    return res.status(200).json({
        success:true,
        message:'Job deleted successfully',
    })
})

// Get single job using id and slug ==> /api/v1/job/:id/:slug

exports.getJob=catchAsyncErrors(async(req,res,next)=>{
    let job=await Job.find({$and:[{_id:req.params.id},{slug:req.params.slug}]})

    if(!job || job.length===0){
        return next(new ErrorHandler('Job Not Found.',404))
    }
    return res.status(200).json({
        success:true,
        data:job
    })

})

//get stats about a job ==>  /api/v1/stats/topic

exports.jobStats=catchAsyncErrors(async(req,res,next)=>{
    const stats=await Job.aggregate([
        {
            $match:{$text:{$search:"\""+req.params.topic+"\""}}
        },
        {
            $group:{
                _id:{$toUpper:'$experiance'},
                totalJobs:{$sum:1},
                avgPosition:{$avg:'$positions'},
                avgSalary:{$avg:'$salary'},
                minSalary:{$min:'$salary'},
                maxSalary:{$max:'$salary'}
            }
        }
    ])
    if(stats.length===0){
        return next(new ErrorHandler(`No stats found for - ${req.params.topic}`,200))
        
    }
    res.status(200).json({
        success:true,
        results:stats.length,
        data:stats
    })
})


// search job within radius ===>   /api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius=catchAsyncErrors(async (req,res,next)=>{
    const {zipcode,distance}=req.params

    //getting latitude and longitude from geocoder using zipcode

    const loc=await geoCoder.geocode(zipcode)
    const latitude=loc[0].latitude
    const longitude=loc[0].longitude

    const radius=distance/3963

    const jobs=await Job.find({
        "location.coordinates":{$geoWithin:{$centerSphere:[[longitude,latitude],radius]}}
    })
    console.log(jobs)
    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs
    })
})