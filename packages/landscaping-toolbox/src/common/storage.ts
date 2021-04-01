import {v4 as uuidv4} from "uuid"
import {Storage} from "aws-amplify"

export async function upload(file: File | undefined) {
    if (!file) return

    let expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 1)

    let key = `${file!!.name}-${uuidv4()}`
    await Storage.put(key, file, {
        level: 'private',
        contentType: 'application/json',
        expires: expiryDate,
    })
    const result = await Storage.get(key, {
        level: 'private',
        expires: 60 * 60, //sec
    })
    console.log(`Uploaded ${file.name} to`, result)
    return result
}
