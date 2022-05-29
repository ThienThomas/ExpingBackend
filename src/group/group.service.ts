import { Injectable } from '@nestjs/common';
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
                admins: parsed.email
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
                console.log(sender)
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
    async getListMember(list : string){
        const parsed = JSON.parse(list)
        console.log(parsed)
        let users = []
        for (const index of parsed){
            const user = await this.prismaService.userprofile.findUnique({
                where: {
                    email: index
                }
            })
            users.push(user)
        }
        return users
    }
}
