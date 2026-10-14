"use client";
import { useState } from 'react';
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function GroupsForm(){
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const router = useRouter();
    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        alert("Department created successfully (Demo Mode)");
        router.push('/admin/admin/groups');
    }
    return(
        <div className = "max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className = "text-2xl font-bold text-slate-900">Create new Department/Group</h1>
                <p className = "text-sm text-slate-500">Enter the name and description of your department or group</p>
            </div>
            
            <form className = "bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm"
            onSubmit = {handleSubmit}>
                <div className = "flex flex-col space-y-2">
                    <label className = "text-sm font-medium text-gray-700">
                        Department Name
                    </label>
                    <input type = "text"
                    value = {name}
                    onChange = {(e) => setName(e.target.value)}
                    className = "bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm text-sm font-medium text-gray-700">
                    </input>
                </div>

                <div className = "flex flex-col space-y-2">
                    <label className = "text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea value = {description}
                    rows = {4}
                    onChange = {(e) => setDescription(e.target.value)}
                    className = "bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm text-sm font-medium text-gray-700">
                    </textarea>
                </div>

                <div className = "flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link href = {`/admin/admin/groups`}
                    className = "px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </Link>
                    
                    <button className = "px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    type = "submit">
                        Save Department
                    </button>
                </div>
            </form>
        </div>
    )
}