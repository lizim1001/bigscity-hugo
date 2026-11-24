// Exact equal-card-count partitioning for this twelve-paper collection.
export function balanceColumns(heights,count){
 const ids=heights.map((_,i)=>i);if(!ids.length)return [];if(count<=1)return [ids];
 const size=ids.length/count;
 if(!Number.isInteger(size)){const groups=Array.from({length:count},()=>[]),sums=groups.map(()=>0);[...ids].sort((a,b)=>heights[b]-heights[a]).forEach(i=>{const c=sums.indexOf(Math.min(...sums));groups[c].push(i);sums[c]+=heights[i]});return groups.map(g=>g.sort((a,b)=>a-b))}
 let best=null,score=Infinity;
 function search(remaining,groups,sums){
  if(groups.length===count-1){const sum=remaining.reduce((s,i)=>s+heights[i],0),all=[...sums,sum],range=Math.max(...all)-Math.min(...all);if(range<score){score=range;best=[...groups,remaining]}return}
  const first=remaining[0],rest=remaining.slice(1);
  function choose(start,picks){if(score===0)return;if(picks.length===size-1){const group=[first,...picks],set=new Set(group);search(remaining.filter(i=>!set.has(i)),[...groups,group],[...sums,group.reduce((s,i)=>s+heights[i],0)]);return}for(let j=start;j<=rest.length-(size-1-picks.length);j++)choose(j+1,[...picks,rest[j]])}
  choose(0,[]);
 }
 search(ids,[],[]);return best;
}
