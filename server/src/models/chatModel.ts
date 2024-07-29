import mongoose, { Schema } from "mongoose";
import type { IChat } from "../types/types";

const chatSchema = new Schema<IChat>({
    members: [{type: Schema.Types.ObjectId, ref: 'User'} ],
    name: {type: String},
    type: {type: String, enum: ["course", "program", "department", "direct"], required: true},
    courses: [{type: Schema.Types.ObjectId, ref: 'Course'}],
    program: {type: Schema.Types.ObjectId, ref: 'Program'},
    department: {type: Schema.Types.ObjectId, ref: 'Department'},
    messages: [
        {
            sender: {type: Schema.Types.ObjectId, ref: 'User'},
            text: {type: String, required: true},
            createdAt: {type: Date, default: Date.now}
        }
    ]
}, {timestamps: true})

const Chat = mongoose.model<IChat>('Chat', chatSchema)

export default Chat