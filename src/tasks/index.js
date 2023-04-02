import applyPenalty from "./applyPenalty.js";
import warningLending from "./warningLending.js";
import checkRecoveryToken from "./checkRecoveryToken.js";

async function execTask(){
  // Inicia contador para contabilizar o tempo de execução da tarefa
  const start = new Date();

  try {
    await applyPenalty();
    await warningLending();
    await checkRecoveryToken();

    console.log("Execução de TASK: ", new Date() - start + "ms");
  }catch (error) {
    console.log(error.message);
  } 
}

// execTask()
export default execTask;