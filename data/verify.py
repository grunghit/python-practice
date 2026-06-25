# -*- coding: utf-8 -*-
"""Ground-truth verification harness for all 45 questions.
Executes each snippet, derives the real result, and checks options[0]."""
import io, contextlib, traceback

results = []

def run_capture(code, ns=None):
    """Exec code, return (stdout_text, exception_or_None, namespace)."""
    if ns is None:
        ns = {}
    buf = io.StringIO()
    err = None
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, ns)
    except Exception as e:
        err = e
    return buf.getvalue().strip(), err, ns

def check(qid, cat, computed, marked, note=""):
    ok = (str(computed).strip() == str(marked).strip())
    results.append((qid, cat, ok, computed, marked, note))

# ---------- C1 / C4 : just compare printed output to options[0] ----------
def output_q(qid, cat, code, marked, note=""):
    out, err, _ = run_capture(code)
    if err:
        out = f"<EXC {type(err).__name__}: {err}>"
    check(qid, cat, out, marked, note)

# Q5 C1
output_q(5, "C1",
"nums = [18, 10, 10, 15, 5, 21, 23, 23, 19]\nbig = 0\nsmall = 0\nfor x in nums:\n    if x > 10:\n        big = big + x\n    else:\n        small = small + 1\nprint(big, small)",
"119 3")

# Q2 C1
output_q(2, "C1",
"text = 'melonbanana'\nres = ''\nn = len(text)\nfor i in range(n):\n    if i % 2 == 0:\n        res = res + text[i].upper()\n    else:\n        res = res + text[i]\nprint(res)",
"MeLoNbAnAnA")

# Q8 C1
output_q(8, "C1",
"items = [4, 3, 1, 9, 2]\nfor i in range(3):\n    x = items.pop()\n    items.insert(0, x + 1)\nprint(items)",
"[2, 10, 3, 4, 3]")

# Q3 C1
output_q(3, "C1",
"text = 'windoworange'\nn = len(text)\nfor i in range(n):\n    if text[i] == 'n':\n        text = text[:i] + '*' + text[i+1:]\nprint(text)",
"wi*dowora*ge")

# Q18 C1
output_q(18, "C1",
"a = [9, 2, 4]\nb = a\nfor i in range(2):\n    b.append(a[i] * 2)\na = a + [2]\nb.append(6)\nprint(len(a), len(b))",
"6 6")

# Q12 C4
output_q(12, "C4",
"m = [[7, 4, 5], [5, 1, 1], [3, 8, 9]]\nt = 0\nfor i in range(len(m)):\n    t = t + m[i][len(m) - 1 - i]\nprint(t)",
"9")

# Q1 C4
output_q(1, "C4",
"nums = [9, 2, 4, 9, 7, 9, 8]\nk = len(nums)\nout = 0\nfor i in range(k):\n    out = out + abs(nums[i] - nums[-i-1])\nprint(out)",
"22")

# Q7 C4
output_q(7, "C4",
"L = [8, 10, 6, 8, 11, 9]\nacc = 0\nk = len(L)\nfor i in range(k):\n    if L[i] % 3 == 0:\n        continue\n    acc = acc + L[i] * i\nprint(acc)",
"78")

# Q19 C4
output_q(19, "C4",
"m = [[3, 9, 4], [8, 3, 9], [5, 2, 7]]\nt = 0\nfor i in range(len(m)):\n    t = t + m[i][0] + m[i][i]\nprint(t)",
"29")

# Q31 C4
output_q(31, "C4",
"a = [9, 8, 8]\nb = a\nfor i in range(2):\n    b.append(a[i] * 2)\na = a + [6]\nb.append(8)\nm = len(a) + len(b)\nprint(m)",
"12")

# Q14 C4
output_q(14, "C4",
"arr = [9, 8, 7, 9, 1, 5]\nk = len(arr)\nout = 0\nfor i in range(k):\n    if i % 2 == 0:\n        out = out + arr[i] - arr[-i-1]\nprint(out)",
"-5")

# Q17 C4
output_q(17, "C4",
"S = '738121'\nparts = []\nst = 0\nfor i in range(3):\n    en = st + 2\n    parts.append(int(S[st:en]))\n    st = en\nd = max(parts) - min(parts)\nprint(d)",
"60")

# Q11 C4
output_q(11, "C4",
"data = [13, 7, 11, 13, 11, 14, 10]\ntotal = 0\nfor v in data:\n    if total > 34:\n        break\n    total = total + v\nprint(total)",
"44")

# Q33 C4
output_q(33, "C4",
"arr = [7, 4, 7, 10, 11]\nout = 0\nk = len(arr)\nfor i in range(k):\n    if arr[i] % 3 == 0:\n        continue\n    out = out + arr[i] * i\nprint(out)",
"92")

# ---------- C3 : count how many times the accumulation line runs ----------
# We instrument by replacing the target operation with a counter.

# Q95: line 7 is `count = count + 1` (the if x%2==0 body)
def q95():
    data = [14, 3, 3, 5, 9, 12, 19, 3]
    count = 0; runs = 0
    for x in data:
        if x > 16: break
        if x % 2 == 0:
            runs += 1; count = count + 1
    return runs
check(95, "C3", q95(), 2, "times line7 count+=1 runs")

# Q96: line 7 is `total = total + x` (under if x>18, after continue on odd)
def q96():
    vals = [2, 25, 6, 22, 5, 14, 21, 20, 16]; total=0; runs=0
    for x in vals:
        if x % 2 == 1: continue
        if x > 18:
            runs+=1; total=total+x
    return runs
check(96, "C3", q96(), 2, "times line7 total+=x runs")

# Q97: line 7 is `c = c + 1` (elif isupper)
def q97():
    s='z9XcV4aQw8'; c=0; runs=0
    for i in range(len(s)):
        if s[i].isdigit(): c=c+2
        elif s[i].isupper(): runs+=1; c=c+1
    return runs
check(97, "C3", q97(), 3, "times line7 c+=1 (isupper) runs")

# Q100: line 7 is `total = total + x` (under if x>15 after odd-continue)
def q100():
    nums=[17,7,28,27,3,14,22]; total=0; runs=0
    for x in nums:
        if x%2==1: continue
        if x>15: runs+=1; total=total+x
    return runs
check(100, "C3", q100(), 2, "times line7 runs")

# Q98: line 8 is `steps = steps + 1`
def q98():
    items=[3,9,8,4,7,4,2]; total=0; steps=0; runs=0
    for v in items:
        total=total+v
        if total>21: break
        runs+=1; steps=steps+1
    return runs
check(98, "C3", q98(), 3, "times line8 steps+=1 runs")

# Q114: line 7 `total = total + x`
def q114():
    items=[14,2,16,8,20,6,15,7]; total=0; runs=0
    for x in items:
        if x%2==1: continue
        if x>12: runs+=1; total=total+x
    return runs
check(114, "C3", q114(), 3, "times line7 runs")

# ---------- C5 : variable value at end of iteration N ----------
# Q74: acc after iteration 2 (1-based)
def q74():
    items=[7,5,15,19,5,14,9]; acc=0
    for it,x in enumerate(items,1):
        if x>10: acc=acc+x
        else: acc=acc-1
        if it==2: return acc
check(74, "C5", q74(), -2, "acc after iter 2")

# Q71: total after iteration 3
def q71():
    data=[3,6,7,9,9]; total=0
    for i in range(len(data)):
        total=total+data[i]-data[-i-1]
        if i+1==3: return total
check(71, "C5", q71(), -9, "total after iter 3")

# Q82: acc after iteration 5
def q82():
    nums=[11,8,15,7,6,10]; acc=0
    for it,x in enumerate(nums,1):
        if x>8: acc=acc+x
        else: acc=acc-1
        if it==5: return acc
check(82, "C5", q82(), 23, "acc after iter 5")

# Q72: res after iteration 6
def q72():
    word='meadowtu'; res=''
    for i in range(len(word)):
        if i%2==0: res=res+word[i].upper()
        else: res=word[i]+res
        if i+1==6: return res
check(72, "C5", q72(), "wdeMAO", "res after iter 6")

# Q73: out after iteration 5
def q73():
    L=[3,4,8,4,6,6]; out=[]
    for i in range(len(L)):
        if L[i]%2==0: out.append(L[i]+i)
        else: out.insert(0,i)
        if i+1==5: return out
check(73, "C5", q73(), [0,5,10,7,10], "out after iter 5")

# Q78: acc after iteration 4
def q78():
    arr=[11,4,16,18,17,7,14]; acc=0
    for it,x in enumerate(arr,1):
        if x>10: acc=acc+x
        else: acc=acc-1
        if it==4: return acc
check(78, "C5", q78(), 44, "acc after iter 4")

# Q79: total after iteration 4
def q79():
    nums=[3,1,5,9,5,3]; total=0
    for i in range(len(nums)):
        total=total+nums[i]-nums[-i-1]
        if i+1==4: return total
check(79, "C5", q79(), -4, "total after iter 4")

# ---------- C2 : evaluate correct statement (options[0]) ----------
# Q149: aliasing, b appends 2 -> len(a)=5
def q149():
    a=[7,3,8]; b=a
    for i in range(2): b.append(a[0]+i)
    return len(a)
check(149, "C2", q149(), 5, "len(a) at end")

# Q151: loop range(2,17,3) -> 2,5,8,11,14 = 5 iterations
check(151, "C2", len(list(range(2,17,3))), 5, "loop body runs N times")

# Q152: sorted(vals) leaves vals unchanged -> True (statement0)
def q152():
    vals=[18,17,10,17,12]; before=list(vals); M=sorted(vals)
    return vals==before
check(152, "C2", q152(), True, "sorted leaves vals unchanged")

# Q150: parts are strings; sum(parts) -> TypeError
def q150():
    S='151969'; parts=[]; st=0
    for i in range(3):
        parts.append(S[st:st+2]); st=st+2
    try:
        sum(parts); return "no error"
    except TypeError: return "TypeError"
check(150, "C2", q150(), "TypeError", "sum(list of str) -> TypeError")

# Q155: a=[7,7,6]; b=a; appends 2 -> a len 5 (b=b+[8] rebinds b only)
def q155():
    a=[7,7,6]; b=a
    for i in range(2): b.append(a[0]+i)
    b=b+[8]
    return len(a)
check(155, "C2", q155(), 5, "len(a) at end")

# Q154: find('x')=-1, p<0 so res = 1*3 = 3
def q154():
    s='breeze'; p=s.find('x'); res=0
    for i in range(3):
        if p<0: res=res+1
        else: res=res+p
    return res
check(154, "C2", q154(), 3, "res at end (find returns -1)")

# ---------- C7 : effect of changing a line ----------
# Q119: original out; change range to range(1,len) ; statement0 = no change
def q119():
    nums=[8,8,2,5,5]
    def orig():
        out=0
        for i in range(len(nums)): out=out+nums[i]*i
        return out
    def mod():
        out=0
        for i in range(1,len(nums)): out=out+nums[i]*i
        return out
    return orig(), mod()
o,m = q119(); check(119, "C7", "no change" if o==m else f"{o}->{m}", "no change", f"orig={o} mod={m}")

# Q124: replace break with no-op -> count counts evens in full list
def q124():
    data=[3,11,2,5,23,1,5]
    def orig():
        count=0
        for x in data:
            if x>16: break
            if x%2==0: count+=1
        return count
    def mod():
        count=0
        for x in data:
            count=count+0
            if x%2==0: count+=1
        return count
    return orig(), mod()
o,m=q124(); check(124,"C7", "no change" if o==m else f"{o}->{m}", "no change", f"orig={o} mod={m}")

# Q121: range(len+1) -> IndexError
def q121():
    vals=[4,11,9,2,8]; total=0
    try:
        for i in range(len(vals)+1): total=total+vals[i]
        return "no error"
    except IndexError: return "IndexError"
check(121,"C7", q121(), "IndexError", "range(len+1) -> IndexError")

# Q122: step 2 -> MRECR
def q122():
    s='marketcar'; res=''
    for i in range(0,len(s),2): res=res+s[i].upper()
    return res
check(122,"C7", q122(), "MRECR", "step2 result")

# Q123: b=a[:] copy -> len(a) stays 3 (was 5) -> "3 instead of 5"
def q123():
    a=[1,4,8]; b=a[:]
    for i in range(2): b.append(i+2)
    return len(a)
check(123,"C7", q123(), 3, "len(a) with copy")

# Q125: x>13 -> x>=13 ; 13 not in list so no change
def q125():
    nums=[9,3,18,6,18,17,19]
    def f(op):
        c=0
        for x in nums:
            if (x>=13 if op=='ge' else x>13): c+=1
        return c
    return f('gt'), f('ge')
o,m=q125(); check(125,"C7","no change" if o==m else f"{o}->{m}","no change",f"gt={o} ge={m}")

# Q128: range(1,len) -> term i=0 (L[0]*0=0) dropped, no change
def q128():
    L=[10,3,9,11,4,4]
    def f(start):
        out=0
        for i in range(start,len(L)): out=out+L[i]*i
        return out
    return f(0), f(1)
o,m=q128(); check(128,"C7","no change" if o==m else f"{o}->{m}","no change",f"full={o} from1={m}")

# ---------- C6 : fix the error ----------
# Q176: original IndexError (i+1 out of range); fix0 = range(len-1); expect sum of adjacent diffs
def q176():
    items=[6,7,10,10,5,4]
    # original
    try:
        d=0
        for i in range(len(items)): d=d+items[i+1]-items[i]
        orig="no error"
    except IndexError: orig="IndexError"
    # fix0
    d=0
    for i in range(len(items)-1): d=d+items[i+1]-items[i]
    return orig, d
o,d=q176(); check(176,"C6", f"{o}|d={d}", "IndexError|d=-2", f"orig={o}, fixed d={d}")

# Q175: parts are str -> sum TypeError; fix0 int() cast
def q175():
    S='57246272';
    parts=[]; st=0
    for i in range(4):
        parts.append(S[st:st+2]); st=st+2
    try:
        sum(parts); orig="no error"
    except TypeError: orig="TypeError"
    parts2=[]; st=0
    for i in range(4):
        parts2.append(int(S[st:st+2])); st=st+2
    return orig, sum(parts2)
o,s=q175(); check(175,"C6", f"{o}|sum={s}", "TypeError|sum=215", f"orig={o}, fixed sum={s}")

# Q177: txt[ch] where ch is a char -> TypeError; fix0 ch.upper()
def q177():
    txt='violet'
    try:
        res=''
        for ch in txt: res=res+txt[ch].upper()
        orig="no error"
    except TypeError: orig="TypeError"
    res=''
    for ch in txt: res=res+ch.upper()
    return orig, res
o,r=q177(); check(177,"C6", f"{o}|{r}", "TypeError|VIOLET", f"orig={o}, fixed={r}")

# Q180: arr.remove(5) 3x but only one 5 -> ValueError; fix0 guard with count
def q180():
    arr=[7,6,5,4,2]
    try:
        a=list(arr)
        for i in range(3): a.remove(5)
        orig="no error"
    except ValueError: orig="ValueError"
    a=list(arr)
    for i in range(3):
        if a.count(5)>0: a.remove(5)
    return orig, a
o,a=q180(); check(180,"C6", f"{o}|{a}", "ValueError|[7, 6, 4, 2]", f"orig={o}, fixed={a}")

# Q178: pop during iteration -> IndexError; fix0 build new list of odds
def q178():
    L=[5,2,9,10,5,9]
    try:
        l=list(L)
        for i in range(len(l)):
            if l[i]%2==0: l.pop(i)
        orig="no error"
    except IndexError: orig="IndexError"
    res=[x for x in L if x%2!=0]
    return orig, res
o,r=q178(); check(178,"C6", f"{o}|{r}", "IndexError|[5, 9, 5, 9]", f"orig={o}, fixed={r}")

# ---------- report ----------
print("="*70)
print(f"{'ID':>4} {'CAT':<4} {'OK':<4} computed -> marked   | note")
print("="*70)
nfail=0
for qid,cat,ok,comp,marked,note in sorted(results, key=lambda r:r[0]):
    flag = "OK " if ok else "XX "
    if not ok: nfail+=1
    print(f"{qid:>4} {cat:<4} {flag} {str(comp)!r:>22} vs {str(marked)!r:<10} | {note}")
print("="*70)
print(f"TOTAL: {len(results)} checks, {nfail} mismatches")
