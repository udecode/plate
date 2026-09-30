# UpdateLayoutTree events in a stream window: count, total ms, and the element
# counts they recalculated (bucketed), from a saved S5 trace.
import json,sys,statistics as st
def summarize(f):
    ev=json.load(open(f))
    start=[e for e in ev if e.get('name')=='s5-start'][0]
    main=[e for e in ev if e.get('pid')==start['pid'] and e.get('tid')==start['tid']]
    marks=sorted(e['ts'] for e in main if e.get('name')=='s5-batch')
    ults=[e for e in main if e.get('name')=='UpdateLayoutTree' and e.get('ph')=='X' and start['ts']<=e['ts']<=marks[-1]]
    rows=[(e.get('args',{}).get('elementCount',0), e.get('dur',0)/1000) for e in ults]
    buckets={'<=10':[0,0.0],'11-100':[0,0.0],'101-1000':[0,0.0],'1001-10000':[0,0.0],'>10000':[0,0.0]}
    for n,d in rows:
        k='<=10' if n<=10 else '11-100' if n<=100 else '101-1000' if n<=1000 else '1001-10000' if n<=10000 else '>10000'
        buckets[k][0]+=1; buckets[k][1]+=d
    return {'commits':len(marks)-1,'events':len(rows),'ms':round(sum(d for _,d in rows),1),'elements':sum(n for n,_ in rows),'buckets':{k:[v[0],round(v[1],1)] for k,v in buckets.items()}}
for f in sys.argv[1:]:
    print(f.split('/')[-1], json.dumps(summarize(f)))
