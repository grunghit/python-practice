// Auto-generated offline fallback — mirror of data/questions.json (do not hand-edit).
// Lets the site work when opened via file:// where fetch() is blocked.
window.__QUESTIONS_FALLBACK__ = {
  "meta": {
    "source": "מאגר שאלות קשות",
    "convention": "options[0] is the correct answer (option א)",
    "count": 45
  },
  "questions": [
    {
      "id": 5,
      "category": "C1",
      "difficulty": "קל",
      "code": "nums = [18, 10, 10, 15, 5, 21, 23, 23, 19]\nbig = 0\nsmall = 0\nfor x in nums:\n    if x > 10:\n        big = big + x\n    else:\n        small = small + 1\nprint(big, small)",
      "prompt": "מה יודפס למסך?",
      "options": [
        "119 3",
        "3 119",
        "139 1",
        "119 6",
        "25 3"
      ],
      "correct_index": 0,
      "explanation": "איברים גדולים מ-10 מצטברים ל-big (18+15+21+23+23+19=119), ושלושת האיברים שאינם גדולים מ-10 (10,10,5) מגדילים את small ל-3."
    },
    {
      "id": 2,
      "category": "C1",
      "difficulty": "בינוני",
      "code": "text = 'melonbanana'\nres = ''\nn = len(text)\nfor i in range(n):\n    if i % 2 == 0:\n        res = res + text[i].upper()\n    else:\n        res = res + text[i]\nprint(res)",
      "prompt": "מה יודפס למסך?",
      "options": [
        "MeLoNbAnAnA",
        "MELONBANANA",
        "mElOnBaNaNa",
        "*el*nb*na*a",
        "ananabnolem"
      ],
      "correct_index": 0,
      "explanation": "באינדקס זוגי האות הופכת לאות גדולה ובאי-זוגי נשארת כפי שהיא, ולכן מתקבל MeLoNbAnAnA."
    },
    {
      "id": 149,
      "category": "C2",
      "difficulty": "קל",
      "code": "a = [7, 3, 8]\nb = a\nfor i in range(2):\n    b.append(a[0] + i)\nprint(len(a), len(b))",
      "prompt": "בחרו את הטענה הנכונה:",
      "options": [
        "בסיום הריצה len(a) שווה ל-5",
        "בסיום הריצה len(a) שווה ל-6",
        "הרשימה a אינה משתנה במהלך הריצה",
        "בסיום הריצה len(b) שווה ל-7",
        "הקריאה b.append גורמת לשגיאת ריצה"
      ],
      "correct_index": 0,
      "explanation": "b=a הוא שם נוסף (alias) לאותה רשימה; שתי קריאות append מוסיפות שני איברים לרשימה המשותפת, ולכן len(a)=len(b)=5."
    },
    {
      "id": 151,
      "category": "C2",
      "difficulty": "בינוני",
      "code": "c = 0\nfor i in range(2, 17, 3):\n    if i % 2 == 0:\n        c = c + i\n    else:\n        c = c - 1\nprint(c)",
      "prompt": "בחרו את הטענה הנכונה:",
      "options": [
        "גוף הלולאה מתבצע בדיוק 5 פעמים",
        "גוף הלולאה מתבצע בדיוק 6 פעמים",
        "גוף הלולאה מתבצע בדיוק 15 פעמים",
        "בסיום הריצה ערכו של i הוא 17",
        "בסיום הריצה ערכו של c הוא 23"
      ],
      "correct_index": 0,
      "explanation": "range(2,17,3) מפיק את הערכים 2,5,8,11,14 — חמישה ערכים, ולכן גוף הלולאה מתבצע בדיוק 5 פעמים."
    },
    {
      "id": 95,
      "category": "C3",
      "difficulty": "קשה",
      "code": "data = [14, 3, 3, 5, 9, 12, 19, 3]\ncount = 0\nfor x in data:\n    if x > 16:\n        break\n    if x % 2 == 0:\n        count = count + 1\nprint(count)",
      "prompt": "כמה פעמים תתבצע הפעולה בשורה 7?",
      "trace_line": 7,
      "options": [
        "2",
        "6",
        "8",
        "1",
        "3"
      ],
      "correct_index": 0,
      "explanation": "ה-break עוצר את הלולאה כשמגיעים ל-19. עד אז האיברים הזוגיים הם 14 ו-12 בלבד, ולכן שורה 7 מתבצעת פעמיים."
    },
    {
      "id": 96,
      "category": "C3",
      "difficulty": "קשה",
      "code": "vals = [2, 25, 6, 22, 5, 14, 21, 20, 16]\ntotal = 0\nfor x in vals:\n    if x % 2 == 1:\n        continue\n    if x > 18:\n        total = total + x\nprint(total)",
      "prompt": "כמה פעמים תתבצע הפעולה בשורה 7?",
      "trace_line": 7,
      "options": [
        "2",
        "4",
        "6",
        "9",
        "3"
      ],
      "correct_index": 0,
      "explanation": "continue מדלג על כל האי-זוגיים. מבין הזוגיים, רק 22 ו-20 גדולים מ-18, ולכן שורה 7 מתבצעת פעמיים."
    },
    {
      "id": 12,
      "category": "C4",
      "difficulty": "קל",
      "code": "m = [[7, 4, 5], [5, 1, 1], [3, 8, 9]]\nt = 0\nfor i in range(len(m)):\n    t = t + m[i][len(m) - 1 - i]\nprint(t)",
      "prompt": "מה יהיה ערכו של המשתנה t בסיום הריצה?",
      "options": [
        "9",
        "17",
        "32",
        "15",
        "43"
      ],
      "correct_index": 0,
      "explanation": "האינדקס len(m)-1-i בוחר את האלכסון המשני: m[0][2]=5, m[1][1]=1, m[2][0]=3, וסכומם 9."
    },
    {
      "id": 1,
      "category": "C4",
      "difficulty": "בינוני",
      "code": "nums = [9, 2, 4, 9, 7, 9, 8]\nk = len(nums)\nout = 0\nfor i in range(k):\n    out = out + abs(nums[i] - nums[-i-1])\nprint(out)",
      "prompt": "מה יהיה ערכו של המשתנה out בסיום הריצה?",
      "options": [
        "22",
        "48",
        "-48",
        "0",
        "11"
      ],
      "correct_index": 0,
      "explanation": "nums[-i-1] משווה כל איבר לאיבר המשקף לו מהקצה הנגדי; סכום הערכים המוחלטים של ההפרשים הוא 22."
    },
    {
      "id": 7,
      "category": "C4",
      "difficulty": "בינוני",
      "code": "L = [8, 10, 6, 8, 11, 9]\nacc = 0\nk = len(L)\nfor i in range(k):\n    if L[i] % 3 == 0:\n        continue\n    acc = acc + L[i] * i\nprint(acc)",
      "prompt": "מה יהיה ערכו של המשתנה acc בסיום הריצה?",
      "options": [
        "78",
        "135",
        "115",
        "57",
        "37"
      ],
      "correct_index": 0,
      "explanation": "איברים המתחלקים ב-3 (6 ו-9) מדולגים ב-continue. שאר האיברים מוכפלים באינדקסם ומצטברים ל-acc=78."
    },
    {
      "id": 74,
      "category": "C5",
      "difficulty": "קל",
      "code": "items = [7, 5, 15, 19, 5, 14, 9]\nacc = 0\nfor x in items:\n    if x > 10:\n        acc = acc + x\n    else:\n        acc = acc - 1\nprint(acc)",
      "prompt": "מה יהיה ערכו של המשתנה acc בתום האיטרציה ה-2?",
      "trace_var": "acc",
      "trace_iter": 2,
      "options": [
        "-2",
        "-1",
        "13",
        "44",
        "12"
      ],
      "correct_index": 0,
      "explanation": "שני האיברים הראשונים (7 ו-5) קטנים מ-10, ולכן acc יורד ב-1 פעמיים ומגיע ל--2 בתום האיטרציה השנייה."
    },
    {
      "id": 71,
      "category": "C5",
      "difficulty": "בינוני",
      "code": "data = [3, 6, 7, 9, 9]\ntotal = 0\nfor i in range(len(data)):\n    total = total + data[i] - data[-i-1]\nprint(total)",
      "prompt": "מה יהיה ערכו של המשתנה total בתום האיטרציה ה-3?",
      "trace_var": "total",
      "trace_iter": 3,
      "options": [
        "-9",
        "-6",
        "0",
        "16",
        "-8"
      ],
      "correct_index": 0,
      "explanation": "בכל איטרציה מתווסף data[i] ומופחת data[-i-1]; הצבירה בתום שלוש האיטרציות הראשונות שווה ל--9."
    },
    {
      "id": 176,
      "category": "C6",
      "difficulty": "קל",
      "code": "items = [6, 7, 10, 10, 5, 4]\nd = 0\nfor i in range(len(items)):\n    d = d + items[i + 1] - items[i]\nprint(d)",
      "prompt": "הרצת הקוד גורמת לשגיאה. מהו התיקון הנכון כדי שהקוד ידפיס את סכום ההפרשים בין איברים סמוכים?",
      "options": [
        "להחליף את שורה 3 ב- for i in range(len(items) - 1):",
        "להחליף את שורה 4 ב- d = d + items[i] - items[i - 1]",
        "להחליף את שורה 3 ב- for i in range(len(items) + 1):",
        "להחליף את שורה 4 ב- d = d + items[i] - items[i]",
        "אין צורך בתיקון — הקוד רץ ומדפיס את סכום ההפרשים"
      ],
      "correct_index": 0,
      "explanation": "באיטרציה האחרונה items[i+1] חורג מגבולות הרשימה (IndexError). הקטנת הטווח ל-range(len(items)-1) פותרת זאת ומדפיסה את סכום ההפרשים (-2)."
    },
    {
      "id": 175,
      "category": "C6",
      "difficulty": "קל",
      "code": "S = '57246272'\nparts = []\nst = 0\nfor i in range(4):\n    parts.append(S[st:st + 2])\n    st = st + 2\nprint(sum(parts))",
      "prompt": "הרצת הקוד גורמת לשגיאה. מהו התיקון הנכון כדי שהקוד ידפיס את סכום החתיכות?",
      "options": [
        "להחליף את שורה 5 ב- parts.append(int(S[st:st + 2]))",
        "להחליף את שורת ההדפסה ב- print(int(sum(parts)))",
        "להחליף את שורת ההדפסה ב- print(sum(int(parts)))",
        "להחליף את שורת ההדפסה ב- print(sum(parts, 0))",
        "אין צורך בתיקון — הקוד תקין ומדפיס את סכום החתיכות"
      ],
      "correct_index": 0,
      "explanation": "החתיכות נשמרות כמחרוזות, ו-sum על רשימת מחרוזות זורק TypeError. המרת כל חתיכה ל-int בעת ההוספה מאפשרת לסכום אותן (התוצאה 215)."
    },
    {
      "id": 119,
      "category": "C7",
      "difficulty": "קל",
      "code": "nums = [8, 8, 2, 5, 5]\nout = 0\nfor i in range(len(nums)):\n    out = out + nums[i] * i\nprint(out)",
      "prompt": "במידה ונשנה את שורה 3 ל- for i in range(1, len(nums)): , מה יקרה?",
      "options": [
        "הפלט לא ישתנה",
        "תתקבל שגיאת ריצה (IndexError)",
        "יודפס 46 במקום 47",
        "יודפס 48 במקום 47",
        "הפלט יוכפל ויודפס 94"
      ],
      "correct_index": 0,
      "explanation": "האיבר באינדקס 0 מוכפל ב-0 ולכן תרומתו אפס; דילוג עליו (התחלה מ-1) אינו משנה את הפלט שנשאר 47."
    },
    {
      "id": 124,
      "category": "C7",
      "difficulty": "קשה",
      "code": "data = [3, 11, 2, 5, 23, 1, 5]\ncount = 0\nfor x in data:\n    if x > 16:\n        break\n    if x % 2 == 0:\n        count = count + 1\nprint(count)",
      "prompt": "במידה ונחליף את שורה 5 (השורה break) בשורה שאינה עושה דבר (count = count + 0), מה יקרה?",
      "options": [
        "הפלט לא ישתנה",
        "תתקבל שגיאת ריצה (IndexError)",
        "יודפס 0 במקום 1",
        "יודפס 2 במקום 1",
        "הפלט יוכפל ויודפס 2"
      ],
      "correct_index": 0,
      "explanation": "בלי ה-break הלולאה ממשיכה על שאר האיברים, אך האיבר הזוגי היחיד הוא 2; הספירה נשארת 1 והפלט אינו משתנה."
    },
    {
      "id": 8,
      "category": "C1",
      "difficulty": "קל",
      "code": "items = [4, 3, 1, 9, 2]\nfor i in range(3):\n    x = items.pop()\n    items.insert(0, x + 1)\nprint(items)",
      "prompt": "מה יודפס למסך?",
      "options": [
        "[2, 10, 3, 4, 3]",
        "[7, 3, 1, 9, 2]",
        "[1, 9, 2, 4, 3]",
        "[10, 3, 4, 3, 1]",
        "[4, 3, 1, 9, 2]"
      ],
      "correct_index": 0,
      "explanation": "בכל סבב נשלף האיבר האחרון, מתווסף לו 1 והוא מוכנס לראש הרשימה; לאחר שלושה סבבים מתקבל [2, 10, 3, 4, 3]."
    },
    {
      "id": 3,
      "category": "C1",
      "difficulty": "קל",
      "code": "text = 'windoworange'\nn = len(text)\nfor i in range(n):\n    if text[i] == 'n':\n        text = text[:i] + '*' + text[i+1:]\nprint(text)",
      "prompt": "מה יודפס למסך?",
      "options": [
        "wi*dowora*ge",
        "wi*doworange",
        "widoworage",
        "windoworange",
        "eg*arowod*iw"
      ],
      "correct_index": 0,
      "explanation": "כל מופע של 'n' מוחלף ב-'*' באינדקס שבו נמצא; שני ה-n שבמילה הופכים לכוכביות → wi*dowora*ge."
    },
    {
      "id": 152,
      "category": "C2",
      "difficulty": "קל",
      "code": "vals = [18, 17, 10, 17, 12]\nM = sorted(vals)\nd = 0\nfor i in range(len(M)):\n    d = d + M[i] - vals[i]\nprint(d)",
      "prompt": "בחרו את הטענה הנכונה:",
      "options": [
        "לאחר הקריאה sorted(vals) הרשימה vals נשארת ללא שינוי",
        "הקריאה sorted(vals) ממיינת את vals עצמה",
        "בסיום הריצה ערכו של d שונה מ-0",
        "M ו-vals מצביעות לאותה רשימה",
        "הקריאה sorted מחזירה None"
      ],
      "correct_index": 0,
      "explanation": "sorted מחזירה רשימה חדשה וממוינת ואינה משנה את vals המקורית (בניגוד ל-list.sort)."
    },
    {
      "id": 150,
      "category": "C2",
      "difficulty": "קל",
      "code": "S = '151969'\nparts = []\nst = 0\nfor i in range(3):\n    parts.append(S[st:st + 2])\n    st = st + 2\nprint(len(parts))",
      "prompt": "בחרו את הטענה הנכונה:",
      "options": [
        "הוספת השורה print(sum(parts)) בסוף הקוד תגרום ל-TypeError",
        "הוספת השורה print(sum(parts)) בסוף הקוד תדפיס 103",
        "הוספת השורה print(sum(parts)) בסוף הקוד תדפיס 151969",
        "בסיום הריצה len(parts) שווה ל-6",
        "האיבר parts[0] הוא מספר שלם (int)"
      ],
      "correct_index": 0,
      "explanation": "החתיכות הן מחרוזות ('15','19','69'); sum מנסה לחבר 0 למחרוזת וזורק TypeError."
    },
    {
      "id": 97,
      "category": "C3",
      "difficulty": "בינוני",
      "code": "s = 'z9XcV4aQw8'\nc = 0\nfor i in range(len(s)):\n    if s[i].isdigit():\n        c = c + 2\n    elif s[i].isupper():\n        c = c + 1\nprint(c)",
      "prompt": "כמה פעמים תתבצע הפעולה בשורה 7?",
      "trace_line": 7,
      "options": [
        "3",
        "4",
        "9",
        "10",
        "6"
      ],
      "correct_index": 0,
      "explanation": "שורה 7 (c=c+1) רצה רק עבור אותיות גדולות שאינן ספרות: X, V, Q — שלוש פעמים."
    },
    {
      "id": 100,
      "category": "C3",
      "difficulty": "קשה",
      "code": "nums = [17, 7, 28, 27, 3, 14, 22]\ntotal = 0\nfor x in nums:\n    if x % 2 == 1:\n        continue\n    if x > 15:\n        total = total + x\nprint(total)",
      "prompt": "כמה פעמים תתבצע הפעולה בשורה 7?",
      "trace_line": 7,
      "options": [
        "2",
        "4",
        "3",
        "7",
        "1"
      ],
      "correct_index": 0,
      "explanation": "האי-זוגיים מדולגים ב-continue. מבין הזוגיים (28,14,22) רק 28 ו-22 גדולים מ-15, ולכן שורה 7 רצה פעמיים."
    },
    {
      "id": 19,
      "category": "C4",
      "difficulty": "קל",
      "code": "m = [[3, 9, 4], [8, 3, 9], [5, 2, 7]]\nt = 0\nfor i in range(len(m)):\n    t = t + m[i][0] + m[i][i]\nprint(t)",
      "prompt": "מה יהיה ערכו של המשתנה t בסיום הריצה?",
      "options": [
        "29",
        "13",
        "12",
        "33",
        "16"
      ],
      "correct_index": 0,
      "explanation": "בכל שורה מתווספים האיבר הראשון m[i][0] והאיבר שעל האלכסון הראשי m[i][i]; הסכום הכולל 29."
    },
    {
      "id": 31,
      "category": "C4",
      "difficulty": "קל",
      "code": "a = [9, 8, 8]\nb = a\nfor i in range(2):\n    b.append(a[i] * 2)\na = a + [6]\nb.append(8)\nm = len(a) + len(b)\nprint(m)",
      "prompt": "מה יהיה ערכו של המשתנה m בסיום הריצה?",
      "options": [
        "12",
        "10",
        "14",
        "6",
        "13"
      ],
      "correct_index": 0,
      "explanation": "שתי קריאות append על הרשימה המשותפת (alias). אז a=a+[6] מנתק את a לרשימה חדשה (אורך 6), ו-b.append(8) מוסיף לרשימה הישנה (אורך 6); m=6+6=12."
    },
    {
      "id": 14,
      "category": "C4",
      "difficulty": "קשה",
      "code": "arr = [9, 8, 7, 9, 1, 5]\nk = len(arr)\nout = 0\nfor i in range(k):\n    if i % 2 == 0:\n        out = out + arr[i] - arr[-i-1]\nprint(out)",
      "prompt": "מה יהיה ערכו של המשתנה out בסיום הריצה?",
      "options": [
        "-5",
        "39",
        "-39",
        "0",
        "26"
      ],
      "correct_index": 0,
      "explanation": "רק אינדקסים זוגיים (0,2,4) תורמים את arr[i]-arr[-i-1]; הצבירה שלהם שווה ל--5."
    },
    {
      "id": 82,
      "category": "C5",
      "difficulty": "קל",
      "code": "nums = [11, 8, 15, 7, 6, 10]\nacc = 0\nfor x in nums:\n    if x > 8:\n        acc = acc + x\n    else:\n        acc = acc - 1\nprint(acc)",
      "prompt": "מה יהיה ערכו של המשתנה acc בתום האיטרציה ה-5?",
      "trace_var": "acc",
      "trace_iter": 5,
      "options": [
        "23",
        "24",
        "33",
        "47",
        "26"
      ],
      "correct_index": 0,
      "explanation": "ערכים >8 מתווספים והשאר מורידים 1. אחרי 11,8,15,7,6: acc=11-? → 11,10,25,24,23, כלומר 23 בתום האיטרציה החמישית."
    },
    {
      "id": 72,
      "category": "C5",
      "difficulty": "בינוני",
      "code": "word = 'meadowtu'\nres = ''\nfor i in range(len(word)):\n    if i % 2 == 0:\n        res = res + word[i].upper()\n    else:\n        res = word[i] + res\nprint(res)",
      "prompt": "מה יהיה ערכו של המשתנה res בתום האיטרציה ה-6?",
      "trace_var": "res",
      "trace_iter": 6,
      "options": [
        "wdeMAO",
        "deMAO",
        "wdeMAOT",
        "uwdeMAOT",
        "MEADOW"
      ],
      "correct_index": 0,
      "explanation": "באינדקס זוגי האות הגדולה נוספת בסוף, ובאי-זוגי האות נוספת בהתחלה; בתום האיטרציה השישית res שווה ל-wdeMAO."
    },
    {
      "id": 73,
      "category": "C5",
      "difficulty": "בינוני",
      "code": "L = [3, 4, 8, 4, 6, 6]\nout = []\nfor i in range(len(L)):\n    if L[i] % 2 == 0:\n        out.append(L[i] + i)\n    else:\n        out.insert(0, i)\nprint(out)",
      "prompt": "מה יהיה ערכו של המשתנה out בתום האיטרציה ה-5?",
      "trace_var": "out",
      "trace_iter": 5,
      "options": [
        "[0, 5, 10, 7, 10]",
        "[0, 5, 10, 7]",
        "[0, 5, 10, 7, 10, 11]",
        "[3, 4, 8, 4, 6]",
        "[0, 1, 2, 3, 4]"
      ],
      "correct_index": 0,
      "explanation": "איבר זוגי מוסיף L[i]+i בסוף, ואי-זוגי מכניס את i בראש הרשימה; בתום חמש האיטרציות out שווה ל-[0, 5, 10, 7, 10]."
    },
    {
      "id": 177,
      "category": "C6",
      "difficulty": "קל",
      "code": "txt = 'violet'\nres = ''\nfor ch in txt:\n    res = res + txt[ch].upper()\nprint(res)",
      "prompt": "הרצת הקוד גורמת לשגיאה. מהו התיקון הנכון כדי שהקוד ידפיס את המחרוזת באותיות גדולות?",
      "options": [
        "להחליף את שורה 4 ב- res = res + ch.upper()",
        "להחליף את שורה 4 ב- res = res + str(txt[ch]).upper()",
        "להחליף את שורה 3 ב- for ch in len(txt):",
        "להחליף את שורה 4 ב- res = res + txt[res].upper()",
        "אין צורך בתיקון — הקוד תקין"
      ],
      "correct_index": 0,
      "explanation": "הלולאה רצה על תווים, ולכן txt[ch] מנסה לאנדקס מחרוזת בעזרת תו וזורק TypeError. שימוש ב-ch עצמו (ch.upper) מדפיס VIOLET."
    },
    {
      "id": 121,
      "category": "C7",
      "difficulty": "קל",
      "code": "vals = [4, 11, 9, 2, 8]\ntotal = 0\nfor i in range(len(vals)):\n    total = total + vals[i]\nprint(total)",
      "prompt": "במידה ונשנה את שורה 3 ל- for i in range(len(vals) + 1): , מה יקרה?",
      "options": [
        "תתקבל שגיאת ריצה (IndexError)",
        "הפלט לא ישתנה",
        "יודפס 34 פעמיים",
        "יודפס 33 במקום 34",
        "יודפס 35 במקום 34"
      ],
      "correct_index": 0,
      "explanation": "הרחבת הטווח ל-len(vals)+1 גורמת לפנייה לאינדקס שאינו קיים בסוף הלולאה, ולכן נזרק IndexError."
    },
    {
      "id": 122,
      "category": "C7",
      "difficulty": "קל",
      "code": "s = 'marketcar'\nres = ''\nfor i in range(0, len(s), 1):\n    res = res + s[i].upper()\nprint(res)",
      "prompt": "במידה ונשנה את שורה 3 ל- for i in range(0, len(s), 2): , מה יקרה?",
      "options": [
        "יודפס MRECR במקום MARKETCAR",
        "הפלט לא ישתנה",
        "תתקבל שגיאת ריצה (IndexError)",
        "יודפס RACTEKRAM במקום MARKETCAR",
        "הפלט יודפס פעמיים"
      ],
      "correct_index": 0,
      "explanation": "צעד 2 בוחר את התווים באינדקסים 0,2,4,6,8 בלבד (m,r,e,c,r) שהופכים לגדולים → MRECR."
    },
    {
      "id": 18,
      "category": "C1",
      "difficulty": "קל",
      "code": "a = [9, 2, 4]\nb = a\nfor i in range(2):\n    b.append(a[i] * 2)\na = a + [2]\nb.append(6)\nprint(len(a), len(b))",
      "prompt": "מה יודפס למסך?",
      "options": [
        "6 6",
        "4 6",
        "7 7",
        "5 5",
        "6 5"
      ],
      "correct_index": 0,
      "explanation": "שתי קריאות append על הרשימה המשותפת; אז a=a+[2] מנתק את a לרשימה חדשה (אורך 6), ו-b.append(6) מוסיף לרשימה הישנה (אורך 6) → '6 6'."
    },
    {
      "id": 155,
      "category": "C2",
      "difficulty": "קל",
      "code": "a = [7, 7, 6]\nb = a\nfor i in range(2):\n    b.append(a[0] + i)\nb = b + [8]\nprint(len(a), len(b))",
      "prompt": "בחרו את הטענה הנכונה:",
      "options": [
        "בסיום הריצה len(a) שווה ל-5",
        "בסיום הריצה len(a) שווה ל-7",
        "הרשימה a אינה משתנה במהלך הריצה",
        "בסיום הריצה len(b) שווה ל-8",
        "הקריאה b.append גורמת לשגיאת ריצה"
      ],
      "correct_index": 0,
      "explanation": "b=a יוצר alias; שתי קריאות append מוסיפות לרשימה המשותפת (אורך 5). השורה b=b+[8] מנתקת רק את b, ולכן len(a) נשאר 5."
    },
    {
      "id": 154,
      "category": "C2",
      "difficulty": "קל",
      "code": "s = 'breeze'\np = s.find('x')\nres = 0\nfor i in range(3):\n    if p < 0:\n        res = res + 1\n    else:\n        res = res + p\nprint(res)",
      "prompt": "בחרו את הטענה הנכונה:",
      "options": [
        "בסיום הריצה ערכו של res הוא 3, כי find מחזירה -1 כשהתו לא נמצא",
        "הקריאה find גורמת לשגיאת ריצה כשהתו לא נמצא",
        "הקריאה find מחזירה None כשהתו לא נמצא",
        "בסיום הריצה ערכו של res הוא 0",
        "בסיום הריצה ערכו של p הוא len(s)"
      ],
      "correct_index": 0,
      "explanation": "find מחזירה -1 כשהתו לא נמצא, ולכן p<0 והענף res=res+1 רץ שלוש פעמים → res=3."
    },
    {
      "id": 98,
      "category": "C3",
      "difficulty": "בינוני",
      "code": "items = [3, 9, 8, 4, 7, 4, 2]\ntotal = 0\nsteps = 0\nfor v in items:\n    total = total + v\n    if total > 21:\n        break\n    steps = steps + 1\nprint(steps)",
      "prompt": "כמה פעמים תתבצע הפעולה בשורה 8?",
      "trace_line": 8,
      "options": [
        "3",
        "4",
        "7",
        "2",
        "6"
      ],
      "correct_index": 0,
      "explanation": "הסכום גדל 3,12,20 ואז 24 (>21) ומפעיל break לפני שורה 8; לכן steps=steps+1 רצה 3 פעמים."
    },
    {
      "id": 114,
      "category": "C3",
      "difficulty": "קשה",
      "code": "items = [14, 2, 16, 8, 20, 6, 15, 7]\ntotal = 0\nfor x in items:\n    if x % 2 == 1:\n        continue\n    if x > 12:\n        total = total + x\nprint(total)",
      "prompt": "כמה פעמים תתבצע הפעולה בשורה 7?",
      "trace_line": 7,
      "options": [
        "3",
        "4",
        "6",
        "8",
        "2"
      ],
      "correct_index": 0,
      "explanation": "האי-זוגיים מדולגים. מבין הזוגיים (14,2,16,8,20,6) רק 14,16,20 גדולים מ-12, ולכן שורה 7 רצה 3 פעמים."
    },
    {
      "id": 17,
      "category": "C4",
      "difficulty": "קל",
      "code": "S = '738121'\nparts = []\nst = 0\nfor i in range(3):\n    en = st + 2\n    parts.append(int(S[st:en]))\n    st = en\nd = max(parts) - min(parts)\nprint(d)",
      "prompt": "מה יהיה ערכו של המשתנה d בסיום הריצה?",
      "options": [
        "60",
        "102",
        "81",
        "21",
        "52"
      ],
      "correct_index": 0,
      "explanation": "המחרוזת מחולקת לחתיכות שלמות 73, 81, 21; d=max-min=81-21=60."
    },
    {
      "id": 11,
      "category": "C4",
      "difficulty": "בינוני",
      "code": "data = [13, 7, 11, 13, 11, 14, 10]\ntotal = 0\nfor v in data:\n    if total > 34:\n        break\n    total = total + v\nprint(total)",
      "prompt": "מה יהיה ערכו של המשתנה total בסיום הריצה?",
      "options": [
        "44",
        "79",
        "31",
        "34",
        "45"
      ],
      "correct_index": 0,
      "explanation": "הבדיקה total>34 מתבצעת לפני ההוספה; הצבירה 13,20,31,44 עוברת את 34, ובסבב הבא הלולאה נעצרת — total=44."
    },
    {
      "id": 33,
      "category": "C4",
      "difficulty": "בינוני",
      "code": "arr = [7, 4, 7, 10, 11]\nout = 0\nk = len(arr)\nfor i in range(k):\n    if arr[i] % 3 == 0:\n        continue\n    out = out + arr[i] * i\nprint(out)",
      "prompt": "מה יהיה ערכו של המשתנה out בסיום הריצה?",
      "options": [
        "92",
        "131",
        "0",
        "39",
        "93"
      ],
      "correct_index": 0,
      "explanation": "אין כאן איבר המתחלק ב-3, ולכן כל איבר מוכפל באינדקסו: 0+4+14+30+44=92."
    },
    {
      "id": 78,
      "category": "C5",
      "difficulty": "קל",
      "code": "arr = [11, 4, 16, 18, 17, 7, 14]\nacc = 0\nfor x in arr:\n    if x > 10:\n        acc = acc + x\n    else:\n        acc = acc - 1\nprint(acc)",
      "prompt": "מה יהיה ערכו של המשתנה acc בתום האיטרציה ה-4?",
      "trace_var": "acc",
      "trace_iter": 4,
      "options": [
        "44",
        "26",
        "61",
        "74",
        "49"
      ],
      "correct_index": 0,
      "explanation": "ערכים >10 מתווספים והשאר מורידים 1. אחרי 11,4,16,18: acc=11,10,26,44 → 44 בתום האיטרציה הרביעית."
    },
    {
      "id": 79,
      "category": "C5",
      "difficulty": "בינוני",
      "code": "nums = [3, 1, 5, 9, 5, 3]\ntotal = 0\nfor i in range(len(nums)):\n    total = total + nums[i] - nums[-i-1]\nprint(total)",
      "prompt": "מה יהיה ערכו של המשתנה total בתום האיטרציה ה-4?",
      "trace_var": "total",
      "trace_iter": 4,
      "options": [
        "-4",
        "-8",
        "0",
        "18",
        "-3"
      ],
      "correct_index": 0,
      "explanation": "בכל איטרציה מתווסף nums[i] ומופחת nums[-i-1]; הצבירה בתום ארבע האיטרציות הראשונות שווה ל--4."
    },
    {
      "id": 180,
      "category": "C6",
      "difficulty": "קל",
      "code": "arr = [7, 6, 5, 4, 2]\nfor i in range(3):\n    arr.remove(5)\nprint(arr)",
      "prompt": "הרצת הקוד גורמת לשגיאה. מהו התיקון הנכון כדי שהקוד ירוץ בהצלחה ויסיר את כל המופעים הקיימים?",
      "options": [
        "לעטוף את ההסרה בתנאי: if arr.count(5) > 0: ורק אז לבצע arr.remove(5)",
        "להחליף את שורה 3 ב- arr.remove(5 + 1)",
        "להחליף את שורה 3 ב- arr.pop(5)",
        "להחליף את שורה 2 ב- for i in range(len(arr)):",
        "אין צורך בתיקון — remove מתעלמת מערך שאינו קיים"
      ],
      "correct_index": 0,
      "explanation": "ברשימה יש 5 אחד בלבד; הקריאה השנייה ל-remove(5) זורקת ValueError. בדיקת arr.count(5)>0 לפני ההסרה מסירה את כל המופעים בבטחה → [7, 6, 4, 2]."
    },
    {
      "id": 178,
      "category": "C6",
      "difficulty": "בינוני",
      "code": "L = [5, 2, 9, 10, 5, 9]\nfor i in range(len(L)):\n    if L[i] % 2 == 0:\n        L.pop(i)\nprint(L)",
      "prompt": "הרצת הקוד גורמת לשגיאה. מהו התיקון הנכון כדי לקבל את הרשימה ללא האיברים הזוגיים?",
      "options": [
        "לבנות רשימה חדשה: להוסיף ב-append רק את האיברים האי-זוגיים ולהדפיס אותה",
        "להחליף את שורה 2 ב- for i in range(len(L) + 1):",
        "להחליף את שורה 4 ב- L.pop(i + 1)",
        "להחליף את שורה 4 ב- L.remove(i)",
        "אין צורך בתיקון — הקוד מדפיס את הרשימה ללא הזוגיים"
      ],
      "correct_index": 0,
      "explanation": "מחיקה תוך כדי איטרציה לפי אינדקס משבשת את האינדקסים וגורמת ל-IndexError. בניית רשימה חדשה עם האי-זוגיים בלבד נותנת [5, 9, 5, 9]."
    },
    {
      "id": 123,
      "category": "C7",
      "difficulty": "קל",
      "code": "a = [1, 4, 8]\nb = a\nfor i in range(2):\n    b.append(i + 2)\nprint(len(a))",
      "prompt": "במידה ונשנה את שורה 2 ל- b = a[:] , מה יקרה?",
      "options": [
        "יודפס 3 במקום 5",
        "הפלט לא ישתנה",
        "תתקבל שגיאת ריצה (IndexError)",
        "יודפס 7 במקום 5",
        "יודפס 4 במקום 5"
      ],
      "correct_index": 0,
      "explanation": "a[:] יוצר עותק נפרד, ולכן append על b אינו משפיע על a; len(a) נשאר 3 במקום 5."
    },
    {
      "id": 125,
      "category": "C7",
      "difficulty": "קל",
      "code": "nums = [9, 3, 18, 6, 18, 17, 19]\nc = 0\nfor x in nums:\n    if x > 13:\n        c = c + 1\nprint(c)",
      "prompt": "במידה ונשנה את שורה 4 ל- if x >= 13: , מה יקרה?",
      "options": [
        "הפלט לא ישתנה",
        "תתקבל שגיאת ריצה (IndexError)",
        "יודפס 3 במקום 4",
        "יודפס 5 במקום 4",
        "הפלט יוכפל ויודפס 8"
      ],
      "correct_index": 0,
      "explanation": "הערך 13 אינו מופיע ברשימה, ולכן המעבר מ->13 ל->=13 אינו משנה את הספירה — הפלט נשאר 4."
    },
    {
      "id": 128,
      "category": "C7",
      "difficulty": "קל",
      "code": "L = [10, 3, 9, 11, 4, 4]\nout = 0\nfor i in range(len(L)):\n    out = out + L[i] * i\nprint(out)",
      "prompt": "במידה ונשנה את שורה 3 ל- for i in range(1, len(L)): , מה יקרה?",
      "options": [
        "הפלט לא ישתנה",
        "תתקבל שגיאת ריצה (IndexError)",
        "יודפס 89 במקום 90",
        "יודפס 91 במקום 90",
        "הפלט יוכפל ויודפס 180"
      ],
      "correct_index": 0,
      "explanation": "האיבר באינדקס 0 מוכפל ב-0 ולכן תרומתו אפס; דילוג עליו (התחלה מ-1) אינו משנה את הפלט שנשאר 90."
    }
  ]
};
