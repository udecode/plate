# For each style recalculation (UpdateLayoutTree) in the stream window, collect
# the invalidation-tracking events since the previous recalculation and
# summarize what scheduled the large (>10,000 element) recalculations.
import json,sys,collections,re
f=sys.argv[1]
raw=json.load(open(f))
ev=raw if isinstance(raw,list) else raw['traceEvents']
start=[e for e in ev if e.get('name')=='si-start'][0]
main=sorted([e for e in ev if e.get('pid')==start['pid'] and e.get('tid')==start['tid'] and e.get('ts',0)>=start['ts']], key=lambda e:e['ts'])
ults=[e for e in main if e['name']=='UpdateLayoutTree' and e.get('ph')=='X']
def short(s, n=90):
    s=s or ''
    s=re.sub(r"class='([^']{0,60})[^']*'", r"class='\1…'", s)
    return s[:n]
prev=start['ts']
big=[];small=[]
schedule_by_big=collections.Counter(); recalc_reason_big=collections.Counter(); recalc_nodes_big=collections.Counter()
schedule_all=collections.Counter()
total_ms=0; big_ms=0
for u in ults:
    n=u.get('args',{}).get('elementCount',0); d=u.get('dur',0)/1000; total_ms+=d
    window=[e for e in main if prev<=e['ts']<u['ts'] and 'InvalidationTracking' in e['name'] and e['name']!='LayoutInvalidationTracking']
    for e in window:
        if e['name']=='ScheduleStyleInvalidationTracking':
            dd=e['args']['data']; key=('attr '+dd['changedAttribute']) if 'changedAttribute' in dd else ('class '+dd['changedClass']) if 'changedClass' in dd else ('pseudo '+dd['changedPseudo']) if 'changedPseudo' in dd else ('id '+dd.get('changedId','?'))
            schedule_all[(key, short(dd.get('nodeName')))]+=1
    if n>10000:
        big_ms+=d
        big.append((u['ts'],n,d))
        for e in window:
            dd=e['args']['data']
            if e['name']=='ScheduleStyleInvalidationTracking':
                key=('attr '+dd['changedAttribute']) if 'changedAttribute' in dd else ('class '+dd['changedClass']) if 'changedClass' in dd else ('pseudo '+dd['changedPseudo']) if 'changedPseudo' in dd else ('id '+dd.get('changedId','?'))
                schedule_by_big[(key, short(dd.get('nodeName')))]+=1
            elif e['name']=='StyleRecalcInvalidationTracking':
                recalc_reason_big[(dd.get('reason') or '?', dd.get('extraData') or '')]+=1
                recalc_nodes_big[(dd.get('reason') or '?', short(dd.get('nodeName'),120))]+=1
    prev=u['ts']+u.get('dur',0)
print(f"recalcs {len(ults)}, total {total_ms:.1f} ms; >10k-element recalcs {len(big)} = {big_ms:.1f} ms, element counts {[b[1] for b in big][:10]}")
print("scheduled invalidations before the big recalcs (count, change, node):")
for (k,node),c in schedule_by_big.most_common(15): print(f"  {c:4d}  {k:28s} {node}")
print("style recalc invalidations before the big recalcs (reason, extra):")
for (r,x),c in recalc_reason_big.most_common(15): print(f"  {c:4d}  {r} {x}")
print("nodes with those recalc invalidations:")
for (r,node),c in recalc_nodes_big.most_common(15): print(f"  {c:4d}  {r:30s} {node}")
print("all scheduled invalidations in the window:")
for (k,node),c in schedule_all.most_common(15): print(f"  {c:4d}  {k:28s} {node}")
