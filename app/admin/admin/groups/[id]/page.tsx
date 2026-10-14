import Link from "next/link";
import {ArrowLeft, Users, Award, Mail} from "lucide-react";

interface Members {
    id: string;
    name: string;
    email: string;
    role: string;
    actionsLogged: number;
}
const MOCK_MEMBERS: Members[] = [
    {   id: "1",
        name: "Taylor Last",
        email: "taylor@gmail.com",
        role: "Faculty Lead",
        actionsLogged: 5
    },
    {   id: "2",
        name: "Kyle Smith",
        email: "ksmith@gmail.com",
        role: "Student Participant",
        actionsLogged: 9
    },
    {   id: "3",
        name: "Samantha Johnson",
        email: "samaJ@hotmail.com",
        role: "Student Participant",
        actionsLogged: 15
    },
    {   id: "4",
        name: "James Wilson",
        email: "jamesWilson@outlook.com",
        role: "Faculty Lead",
        actionsLogged: 12
    },
    {   id: "5",
        name: "Linda Jones",
        email: "liJones@outlook.com",
        role: "Student Participant",
        actionsLogged: 6
    },
]

interface PageProps { 
  params: Promise<{ id: string }>; 
} 
 
export default async function GroupDetailPage({ params }: PageProps) { 
  //const { id } = await params; 
  // Use id to look up data or display department details
    return(
        <div>
            <Link href = {`/admin/admin/groups`}
            className="text-slate-800 font-regular text-sm hover:underline flex items-center">
                <button type="button"
                className = "px-4 py-2 bg-gray-400 text-black rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Department
                </button>
            </Link>
            <div className="mt-4">
                <div className = "bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h1 className = "text-2xl font-bold text-slate-900">School of Engineering</h1>
                    <div className="mt-4">
                        <p className = "text-sm text-slate-500">Collection of students and faculty from the School of Engineering</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900">Total Members</span>
                                <span className="text-2xl font-bold text-slate-900">48</span>
                            </div>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                            <div className = "flex flex-col">
                                <span className="text-sm font-medium text-slate-900">Total Points Earned</span>
                                <span className="text-2xl font-bold text-slate-900">1,250</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div >
                <table className = "min-w-full divide-y divide-slate-200 overflow-x-auto">
                    <thead>
                        <tr>
                            <th className = "bg-slate-50 text-slate-500 uppercase text-xs font-semibold"> Members</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_MEMBERS.map((Members) => (
                        <tr key = {Members.id} className ="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:bg-gray-500 transition-colors">
                            <td className ="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{Members.name}</td>
                            <td>{Members.email}</td>
                            <td>{Members.role}</td>
                            <td>{Members.actionsLogged}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}