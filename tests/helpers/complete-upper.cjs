/* Legacy feature suites exercise their own effects after the new mandatory review.
 * The full bicameral suite tests staging, real support, failure and AP accounting.
 */
module.exports=function completeUpperInFeatureTests(context){require('node:vm').runInContext(`
if(typeof upperReview108==='function'){
 function completeUpperFixture108(){
  if(!upperBill108())return;
  const u=bicameral108().upper;if(!u.formed){u.draft={establishment:40,progressive:30,conservative:30};formSenate108()}
  const realUpper=upperSupport108;upperSupport108=()=>100;try{upperReview108()}finally{upperSupport108=realUpper}
 }
 const voteFixtureBefore108=voteBill,constitutionFixtureBefore108=voteConstitution,proposeFixtureBefore108=proposeConstitution;
 voteBill=function(...args){const out=voteFixtureBefore108(...args);completeUpperFixture108();return out};
 voteConstitution=function(...args){const out=constitutionFixtureBefore108(...args);if(!args[0])completeUpperFixture108();return out};
 proposeConstitution=function(...args){const out=proposeFixtureBefore108(...args);if(isFederal108()&&args[0]==='amend')completeUpperFixture108();return out};
}
`,context)};
