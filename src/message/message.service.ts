import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
    constructor(private prismaService: PrismaService) {}
    async getLastestMessages(email : string){
        const mess = await this.prismaService.messages.findMany({
            where: {
                participants: {
                    has: email
                }
            },
            orderBy:{
                createdAt: 'desc'
            },
            distinct: ['participants']
        })
        let result = []
        for (const index of mess){
            const fremail = index.participants.find((e) => e !== email)
            const res = await this.prismaService.userprofile.findUnique({
                where: {
                    email: fremail
                },
                select:{
                    photoURL: true,
                    displayName: true
                }
            })
            result.push({
                ...index,
                partnerPhotoURL: res.photoURL,
                partnerName: res.displayName,
                partnerEmail: fremail
            })
        }
        return result
    }
    async getMess(email: string, fremail: string){
        const result =  await this.prismaService.messages.findMany({
            where:{
                AND: [
                    {
                    participants: {
                        has: email
                    }
                },{
                    participants: {
                        has: fremail
                        }
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
        })
        result.forEach((element)  => {
                element['_id'] = element.docid
                element['user'] = {
                    _id: element.sentBy
                }
            }     
        )
        return result
    }
    async sendMess(participants : [], createdAt : Date, sentBy : string, sendTo : string, text : string, type : string){
        const result = await this.prismaService.messages.create({
            data:{
                participants: participants,
                createdAt: createdAt,
                sendTo: sendTo,
                sentBy: sentBy,
                text: text,
                type: type
            }
        })
        // const result2 = await this.prismaService.lastestmessage.findFirst({
        //     where: {
        //         AND: [
        //             {
        //                 participants: {
        //                     has: sendTo
        //                 }
        //             }, 
        //             {
        //                 participants: {
        //                     has: sentBy
        //                 }
        //             }
        //         ]
        //     }
        //     ,
        //     select: {
        //         docid: true
        //     }
        // })
        // const result3 = await this.prismaService.lastestmessage.update({
        //     where: {
        //         docid: result2.docid
        //     },
        //     data: {
        //         text: text,
        //         createdAt: createdAt,
        //         system: false,
        //         sentBy: sentBy,
        //         sendTo: sendTo
        //     }
        // })
        if (result){
            return "message sent"
        }
        else throw new BadRequestException("error")
     }
    async sendImgMess(participants : [], createdAt : Date, sentBy : string, sendTo : string, url : string, type : string){
        const result = await this.prismaService.messages.create({
            data:{
                participants: participants,
                createdAt: createdAt,
                sendTo: sendTo,
                sentBy: sentBy,
                image: url,
                type: type
            }
        })
        if (result){
            return "image sent"
        }
        else throw new BadRequestException("error")
    }
    async sendvideomess(participants : [], createdAt : Date, sentBy : string, sendTo : string, url : string, type : string){
        const result = await this.prismaService.messages.create({
            data:{
                participants: participants,
                createdAt: createdAt,
                sendTo: sendTo,
                sentBy: sentBy,
                video: url,
                type: type
            }
        })
        if (result){
            return "video sent"
        }
        else throw new BadRequestException("error")
    }
    async sendDocMess(participants : [], createdAt : Date, sentBy : string, sendTo : string, url : string, type : string, attachmentname: string) {
        const result = await this.prismaService.messages.create({
            data:{
                participants: participants,
                createdAt: createdAt,
                sendTo: sendTo,
                sentBy: sentBy,
                attachmentid: url,
                attachmentname: attachmentname,
                type: type
            }
        })
        if (result){
            return "attachemnt sent"
        }
        else return "Fail"
    }
    async sendAudioMess(participants : [], createdAt : Date, sentBy : string, sendTo : string, url : string, type : string){
        const result = await this.prismaService.messages.create({
            data:{
                participants: participants,
                createdAt: createdAt,
                sendTo: sendTo,
                sentBy: sentBy,
                audio: url,
                type: type,
                text: ''
            }
        })
        if (result){
            return "audio sent"
        }
        else return "Fail"
    }
    async sendgifMess(participants : [], createdAt : Date, sentBy : string, sendTo : string, gif : string, type : string){
        const result = await this.prismaService.messages.create({
            data:{
                participants: participants,
                createdAt: createdAt,
                sendTo: sendTo,
                sentBy: sentBy,
                gif: gif,
                type: type
            }
        })
        if (result){
            return "gifted sent"
        }
        else throw new BadRequestException("error")
    }
    async getImgMess(email: string, fremail: string){
        const res = await this.prismaService.messages.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            has: email
                        }
                    },
                    {
                        participants:{
                            has: fremail
                        }
                    },
                    {
                        type: "image"
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                image: true
            }
        })
        if (res) {
            return res
        }
        return [];
    }
    async getVidMess(email: string, fremail: string){
        const res = await this.prismaService.messages.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            has: email
                        }
                    },
                    {
                        participants:{
                            has: fremail
                        }
                    },
                    {
                        type: "video"
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                video: true
            }
        })
        if (res) {
            return res
        }
        return [];
    }
    async getDocMess(email: string, fremail: string){
        const res = await this.prismaService.messages.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            has: email
                        }
                    },
                    {
                        participants:{
                            has: fremail
                        }
                    },
                    {
                        type: "document"
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                attachmentid: true,
                attachmentname: true
            }
        })
        if (res) {
            return res
        }
        return [];
    }
}
