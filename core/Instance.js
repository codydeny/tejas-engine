const definationInstance = require('../models/DefinationInstance');
const { v4: uuidv4 } = require('uuid');

module.exports.initialize = async (defination) => {
    return new Promise((resolve, reject) => {
        definationInstance.create({
        instanceId: uuidv4(),
        instanceType: defination._id,
        instanceState: 'IN_PROGRESS',
        currentStep: 'START_STEP',
        stepData: {
            START_STEP: {
                status: 'EXECUTED',
                data: {},
                createdAt: new Date()
            }
        },
        createdAt: new Date(),
        updatedAt: new Date()
        }).then((ans) => {
        resolve(ans);
        }).catch((err) => {
        reject(err);
        })
    })
}

module.exports.getInstance = (instanceId) => {
    return new Promise((resolve, reject) => {
        definationInstance.findOne({instanceId: instanceId}).then((ans) => {
        resolve(ans);
        }).catch((err) => {
        reject(err);
        })
    })
}

module.exports.execute = async (instanceId, stepData, user) => {

    return new Promise(async (resolve, reject) => {
        let instance = await definationInstance.findOne({instanceId: instanceId}).populate('instanceType').exec();
        let currentStep = instance.currentStep;

        if(currentStep === 'END_STEP') {
            resolve(instance);
            return;
        }

        if(currentStep === 'START_STEP') {
            if(!instance.instanceType.watchers.includes(user.userType)) {
                reject({message: 'User is not allowed to execute this workflow'});
                return;
            }
        }
        else {
            if(!instance.instanceType.steps[currentStep].actors.includes(user.userType)) {
                reject({message: 'User is not allowed to execute this step'});
                return;
            }
        }
        
        let instanceState = instance.instanceType.steps[currentStep].next === 'END_STEP' ? 'FINISHED' : 'IN_PROGRESS';
        // update stepData

        if(instance.instanceType.steps[currentStep].next === 'END_STEP') {
            definationInstance.findOneAndUpdate(
                {instanceId: instanceId},
                {
                    "$set": {
                        [`stepData.${currentStep}`] : {
                            "status" : 'EXECUTED',
                            "data" : stepData,
                            "createdAt" : new Date(),
                            "actor" : user
                        },
                        "END_STEP" : {
                            status : 'EXECUTED',
                            data : stepData,
                            createdAt : new Date(),
                        }
                    },
                    currentStep : 'END_STEP',
                    instanceState : 'FINISHED',
                },
                {new : true}
            ).then((response)=> {resolve(response)}).catch((error)=> {reject(error)})
        }
        else {
           definationInstance.findOneAndUpdate(
                {instanceId: instanceId},
                    {
                        "$set": {
                            [`stepData.${currentStep}`] : {
                                "status" : 'EXECUTED',
                                "data" : stepData,
                                "createdAt" : new Date(),
                                "actor" : user
                            }
                        },
                        currentStep : instance.instanceType.steps[currentStep].next,
                        instanceState : instanceState,
                    },
                {new : true}
            ).then((response)=> {resolve(response)}).catch((error)=> {reject(error)})
        }
    })
}

