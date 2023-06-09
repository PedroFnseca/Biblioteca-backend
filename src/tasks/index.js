import applyPenalty from "./applyPenalty.js";
import warningLending from "./warningLending.js";
import checkRecoveryToken from "./checkRecoveryToken.js";

async function execTask(){

  try {
    await applyPenalty();
    await warningLending();
    await checkRecoveryToken();
  }catch (error) {
    console.log(error.message);
  } 
}

// execTask()
export default execTask;