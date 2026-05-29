const SAVE_KEY = "bloodDistrictSave";

function createNewSave(){
  const save = {
    mission:1,
    completed:false
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  return save;
}

function loadSave(){
  const data = localStorage.getItem(SAVE_KEY);
  if(!data) return null;
  return JSON.parse(data);
}

function hasSave(){
  return localStorage.getItem(SAVE_KEY) !== null;
}