/* Completion depends on all required work, not on the currently selected mode. */
(() => {
  function bloodComplete(s){return Boolean(s.uploaded||s.selfFields?.bloodUploaded==='on')}
  function requirements(day,s){
    const selfRecord=s.selfDone&&!s.voiceDone;
    return {
      blood:Boolean(s.followupNeeds?.blood||s.callTasks?.includes('blood')||(selfRecord&&day.tasks.some(t=>t.type==='upload'))),
      rash:Boolean(s.followupNeeds?.rash||s.callTasks?.includes('rash')||s.rashReported)
    };
  }
  function complete(day,s){
    if(day.kind==='past')return true;
    if(day.kind!=='today'||!(s.voiceDone||s.selfDone))return false;
    const needs=requirements(day,s);
    return (!needs.blood||bloodComplete(s))&&(!needs.rash||Boolean(s.rashPhotoUploaded));
  }
  window.DayCompletion={bloodComplete,requirements,complete};
})();
