RegisterCommand("skipQueue", function(source, args, rawCommand)
    if source == 0 then
        local tempId = tonumber(args[1])
        exports.rm_queue:skipQueue(tempId)
    end
end)

RegisterCommand("queue", function(source, args, rawCommand)
    if source == 0 then
        local shouldClose = tostring(args[1])
        if shouldClose then
            if shouldClose == "open" then
                exports.rm_queue:queue(false)
            elseif shouldClose == "close" then
                exports.rm_queue:queue(true)
            end
        end
    end
end)

RegisterCommand("getQueueList", function(source, args, rawCommand)
    if source == 0 then
        local queueList = exports.rm_queue:getQueueList()
        print(("Queue list: %s"):format(json.encode(queueList, { indent = true })))
    end
end)

RegisterCommand("getQueueSize", function(source, args, rawCommand)
    if source == 0 then
        local queueSize = exports.rm_queue:getQueueSize()
        print(("Queue size: %s"):format(queueSize))
    end
end)

RegisterCommand("getLoadingPlayers", function(source, args, rawCommand)
    if source == 0 then
        local loadingPlayers = exports.rm_queue:getLoadingPlayers()
        print(("Loading players: %s"):format(json.encode(loadingPlayers, { indent = true })))
    end
end)
