import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupService {
    constructor(private readonly prismaService: PrismaService){}
    
    async createGroupInfo(data : string, url : string) {
        const parsed = JSON.parse(data)
        parsed.participants.push(parsed.email)
        const arr = parsed.participants.sort().reverse()
        const result = await this.prismaService.groupinfo.create({
            data: {
                photoURL: url,
                participants: parsed.participants,
                groupname: parsed.displayName,
                admins: parsed.email,
                waitingforaccept: [`${nanoid()}`]
            }
        })

        const result2 = await this.prismaService.groupmessages.create({
            data: {
                groupid: result.docid,
                createdAt: new Date(),
                system: true,
                text: "Các bạn hiện đang kết nối trên Exping"
            }
        })
        const result3 = await this.prismaService.groupmessages.create({
            data: {
                groupid: result.docid,
                createdAt: new Date(),
                system: true,
                text: "Các bạn hiện đang kết nối trên Exping"
            }
        })
        if (result && result2 && result3){
            return "created"
        }
        return "fail"
    }
    async getAllMess(email : string){
        const result = await this.prismaService.groupinfo.findMany({
            where:{ 
                participants : {
                    has: email
                }
            }
        })
        let messages = []
        if (result.length > 0) {
            for(const index of result){
                const mess = await this.prismaService.groupmessages.findFirst({
                    where:{
                        groupid: index.docid
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                })
                let sender = {
                    displayName: "system"
                }
                if (mess && !mess.system){
                    sender = await this.prismaService.userprofile.findUnique({
                        where: {
                            email: mess.sentBy
                        }
                    })
                } 
                //console.log(sender)
                messages.push({
                    groupinfo: {
                        ...index,
                    },
                    message: {
                        ...mess,
                    },
                    sender:{
                        ...sender
                    }
                })
                
            }
        }
        return messages.sort((a,b) => (a.message.createdAt > b.message.createdAt) ? -1 : ((b.message.createdAt > a.message.createdAt) ? 1 : 0))
    }
    async getAllMessages(docid : string){
        const result = await this.prismaService.groupmessages.findMany({
            where: {
                groupid: docid
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        let mess = []
        if (result) {
            for(const index of result){
                if (index.sentBy){
                    const sender = await this.prismaService.userprofile.findFirst({
                        where: {
                            email: index.sentBy
                        }
                    })
                    mess.push({
                        ...index,
                        sender,
                        _id: index.docid,
                        user:  {
                            _id: index.sentBy
                        }
                    })
                }
                else {
                    mess.push({
                        ...index,
                        _id: index.docid,
                        user:  {
                            _id: index.sentBy
                        }
                    })
                }
            }
        }
        return mess
    }
    async sendGroupTextMss(groupid : string, sentBy : string, createdAt : Date, text : string){
        const result =  await this.prismaService.groupmessages.create({
            data:{
                groupid: groupid,
                sentBy: sentBy,
                createdAt: createdAt,
                text: text,
                type: 'text'
            }
        })
        if (result) {
            return "sent"
        }
        return "fail"
    }
    async sendImgMess(data : string, url : string){
        const parsed = JSON.parse(data)
        const result = await this.prismaService.groupmessages.create({
            data: {
                groupid: parsed.groupid,
                sentBy: parsed.sentBy,
                image: url,
                createdAt: parsed.createdAt,
                type: 'image'
            }
        })
        if (result) {
            return "image sent"
        }
        return "fail"
    }
    async sendvidMess(data : string, url : string){
        const parsed = JSON.parse(data)
        const result = await this.prismaService.groupmessages.create({
            data: {
                groupid: parsed.groupid,
                sentBy: parsed.sentBy,
                video: url,
                createdAt: parsed.createdAt,
                type: 'video'
            }
        })
        if (result) {
            return "video sent"
        }
        return "fail"
    }
    async sendDocMess(data : string, url : string){
        const parsed = JSON.parse(data)
        const result = await this.prismaService.groupmessages.create({
            data:{
                groupid: parsed.groupid,
                sentBy: parsed.sentBy,
                attachmentid: url,
                attachmentname: parsed.attachmentname,
                createdAt: parsed.createdAt,
                type: 'document'
            }
        })
        if (result) {
            return "doc sent"
        }
        return "fail"
    }
    async sendAudioMess(data: string, url : string){
        const parsed = JSON.parse(data)
        const result = await this.prismaService.groupmessages.create({
            data:{
                groupid: parsed.groupid,
                sentBy: parsed.sentBy,
                audio: url,
                createdAt: parsed.createdAt,
                type: 'audio'
            }
        })
        if (result) {
            return "audio sent"
        }
        return "fail"
    }
    async sendgifMess(groupid : string, createdAt : Date, sentBy : string, gif : string){
        const result = await this.prismaService.groupmessages.create({
            data:{ 
                groupid: groupid,
                createdAt: createdAt,
                sentBy: sentBy,
                gif: gif,
                type: 'gif'
            }
        })
        if (result) {
            return "gif sent"
        }
        return "fail"
    }
    async getListMember(list : string, email: string){
        const parsed = JSON.parse(list)
       // console.log(parsed)
        let users = []
        for (const index of parsed){
            const user = await this.prismaService.userprofile.findUnique({
                where: {
                    email: index,
                }
            })
            if (user.email !== email) {
                users.push(user)
            }
        }
        return users
    }
    async getImageList(groupid : string){
        const images = this.prismaService.groupmessages.findMany({
            where: {
                groupid: groupid,
                type: 'image'
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                image: true,
                createdAt: true
            }
        })        
        if (images) return images
        return []
    }
    async getVidList(groupid : string){
        const videos = this.prismaService.groupmessages.findMany({
            where: {
                groupid: groupid,
                type: 'video'
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                video: true,
                createdAt: true
            }
        })        
        if (videos) return videos
        return []
    }
    async getDocList(groupid : string){
        const docs = this.prismaService.groupmessages.findMany({
            where: {
                groupid: groupid,
                type: 'document'
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                attachmentid: true,
                attachmentname: true,
                createdAt: true
            }
        })        
        if (docs) return docs
        return []
    }
    async getlistoflastfriends(email : string, list : string, groupid: string){
        if (list) {
            const parsed = JSON.parse(list)
            let arr = []
            let users = []
            const friends = await this.prismaService.userlistfriends.findUnique({
                where:{
                    email: email
                }
            })
            const waiting = await this.prismaService.groupinfo.findUnique({
                where:{
                    docid: groupid
                },
                select:{
                    participants: true
                }
            })
            //console.log(friends)
            if (friends) {
                arr = friends.listfriends.filter((e : string) => {
                    return parsed.indexOf(e) === -1;
                })
            }
            if (waiting){
                let arr2 = arr
                if (waiting.participants.length > 0) {
                    arr = arr2.filter((e : string) => {
                        return waiting.participants.indexOf(e) === -1;
                    })
                }
            }
            if (arr.length > 0) {
                for (const index of arr){
                    const user = await this.prismaService.userprofile.findUnique({
                        where: {
                            email: index
                        }
                    })
                    if (user.email !== email) {
                        users.push(user)
                    }
                }
            }
            return users
        }
        return []
    }
    async removeMember(email : string, groupid : string,  remover: string){
        const result = await this.prismaService.groupinfo.findUnique({
            where: {
                docid: groupid
            }
        })
        let arr = []
        for (const index of result.participants){
            if (index != email) {
                arr.push(index)
            }
        }
        const updated = await this.prismaService.groupinfo.update({
            where: {
                docid: groupid
            },
            data: {
                participants: arr
            }
        })
        //console.log(updated)
        if (updated) {
            const user = await this.prismaService.userprofile.findFirst({
                where: {
                    email: remover
                }
            })
            const user2 = await this.prismaService.userprofile.findFirst({
                where: {
                    email: email
                }
            })
            const result2 = await this.prismaService.groupmessages.create({
                data: {
                    groupid: groupid,
                    createdAt: new Date(),
                    system: true,
                    text:  `${user.displayName} đã xóa ${user2.displayName} ra khỏi nhóm`
                }
            })
            
            if (result2) {
                const group = await this.prismaService.groupinfo.findUnique({
                    where: {
                        docid: groupid
                    },
                    select: {
                        participants: true
                    }
                })
                if (group.participants.length <= 2){
                    const deleted = await this.prismaService.groupinfo.delete({
                        where: {
                            docid: groupid
                        }
                    })
                    return "removed"
                }
                return "removed"
            }
            return "fail"
        }
        return "fail"
    }
    async outgroup(email : string, groupid: string){
        const result = await this.prismaService.groupinfo.findUnique({
            where: {
                docid: groupid
            }
        })
        let arr = []
        for (const index of result.participants){
            if (index != email) {
                arr.push(index)
            }
        }
        const updated = await this.prismaService.groupinfo.update({
            where: {
                docid: groupid
            },
            data: {
                participants: arr
            }
        })
        if (updated) {
            const user2 = await this.prismaService.userprofile.findUnique({
                where: {
                    email: email
                }
            })
            const result2 = await this.prismaService.groupmessages.create({
                data: {
                    groupid: groupid,
                    createdAt: new Date(),
                    system: true,
                    text:  `${user2.displayName} đã rời khỏi nhóm`
                }
            })
            if (result2) {
                const group = await this.prismaService.groupinfo.findUnique({
                    where: {
                        docid: groupid
                    },
                    select: {
                        participants: true
                    }
                })
                if (group.participants.length <= 2){
                    const deleted = await this.prismaService.groupinfo.delete({
                        where: {
                            docid: groupid
                        }
                    })
                    return "removed"
                }
                return "removed"
            }
            return "fail"
        }
        return "fail"
    }
    async addtogroup(email :string, groupid: string, admin : boolean){
        if (admin === true) {
            const result = await this.prismaService.groupinfo.update({
                where:{
                    docid: groupid,
                },
                data: {
                    participants: {
                        push: email
                    }
                }
            })
            const user = await this.prismaService.userprofile.findFirst({
                where: {
                    email: email
                }
            })
            const mes = await this.prismaService.groupmessages.create({
                data:{
                    groupid: groupid,
                    system: true,
                    createdAt: new Date(),
                    text: `${user.displayName} đã được QTV thêm vào nhóm`
                }
            })
            const update = await this.prismaService.groupinfo.findFirst({
                where:{
                    docid :groupid
                }
            })
            if (update) {
                let arr = update.waitingforaccept.filter(e => 
                    {return e !== email}
                )
                await this.prismaService.groupinfo.update({
                    where:{
                        docid : groupid
                    },
                    data: {
                        waitingforaccept: arr
                    }
                })
            }
            if (result) return "addtogroup"
        }
        else {
            const result = await this.prismaService.groupinfo.update({
                where:{
                    docid: groupid,
                },
                data: {
                    waitingforaccept: {
                        push: email
                    }
                }
            })
            if (result) return "addtoqueue"
        }
        return "fail"
    }
    async getWaitting(groupid : string){
        const waiting = await this.prismaService.groupinfo.findUnique({
            where: {
                docid: groupid
            }
        })
        let users = []
        if (waiting) {
            for (const index of waiting.waitingforaccept) {
                const user = await this.prismaService.userprofile.findFirst({
                    where: {
                        email: index
                    }
                })
                console.log(user)
                users.push(user)
            }
        }
        users.shift()
        return users
    }
    async deletegroup(groupid){
        const result =  await this.prismaService.groupinfo.delete({
            where: {
                docid: groupid
            }
        })
        if (result) return "ok"
        return "fail"
    }
}
