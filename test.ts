import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim().replace(/['"\r]/g, '');
    }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'] || env['VITE_SUPABASE_URL'];
const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || env['VITE_SUPABASE_ANON_KEY'];

async function run() {
    const res = await fetch(`${url}/rest/v1/evaluation_records?select=id,month,student_id,indicator_id,grade,students(first_name,last_name,grade,english_level),competencies:indicator_id(subject,description,type)&limit=100`, {
        headers: {
            'apikey': key!,
            'Authorization': `Bearer ${key}`
        }
    });

    const data = await res.json();
    console.log(`Total records: ${data.length}`);

    if (data.length > 0) {
        const withEnglish = data.filter((r: any) => r.students && r.students.english_level);
        console.log(`With english_level: ${withEnglish.length}`);

        const myFilter = data.filter((r: any) => {
            const studentGrade = r.students?.grade;
            const competencySubject = r.competencies?.subject;
            return ['5to Grado', '6to Grado'].includes(studentGrade) &&
                r.students?.english_level === 'Upper' &&
                competencySubject === 'Inglés';
        });

        console.log(`Match Inglés: Upper logic: ${myFilter.length}`);
        if (myFilter.length === 0 && withEnglish.length > 0) {
            console.log("Here is a sample english record:");
            console.dir(withEnglish[0], { depth: null });
        } else if (myFilter.length > 0) {
            console.log("Here is an Upper English logic match:");
            console.dir(myFilter[0], { depth: null });
        }

        console.log("Distinct months in db:");
        const months = new Set(data.map((d: any) => d.month));
        console.log(Array.from(months));
    }
}

run().catch(console.error);
