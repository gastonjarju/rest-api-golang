package routes

import (
	"net/http"
	"strconv"

	"github.com/gastonjarju/rest-api/models"
	"github.com/gin-gonic/gin"
)


func getEvent(context *gin.Context) {
	eventId, err := strconv.ParseInt(context.Param("id"), 10, 64) // convert string to int
	if err!= nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Could not parse event ID"})
		return

	}
	
	event, err := models.GetEventById(eventId)
	if err !=nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not fetch event"})
		return
	}
	
	context.JSON(http.StatusOK, event)
}


func getEvents(context *gin.Context) {
	events, err := models.GetAllEvents()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not fetch events. Try again later"})
		return
	}
	context.JSON(http.StatusOK, events)
	
}


func createEvent(context *gin.Context) {

	var event models.Event
	err := context.ShouldBindJSON(&event)
	if err !=nil {
		context.JSON(http.StatusBadRequest, gin.H{"message":"Could not parse request data"})
		return
	}
	
	userId := context.GetInt64("userId")
	event.UserID = userId
	
	err = event.Save()
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message":"Could not create event. Maybe try again later"})
		return
	}
	
	context.JSON(http.StatusCreated, gin.H{"message": "Event created!", "event": event})
}



func updateEvent(context *gin.Context) {
	eventId, err := strconv.ParseInt(context.Param("id"), 10, 64) // convert string to int
	if err!= nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Could not parse event ID"})
		return
	
	}

	userId := context.GetInt64("userId")
	event, err := models.GetEventById(eventId)

	if err!=nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not fetch event"})
		return 
	}

	if event.UserID != userId {
		context.JSON(http.StatusUnauthorized, gin.H{"message": "Not authorized to update event"})
		return

	}
	
	var updatedEvent models.Event
	err = context.ShouldBindJSON(&updatedEvent)
	
	if err!=nil {
		context.JSON(http.StatusBadRequest, gin.H{"message":"Could not create event. Maybe try again later"})
		return
	}
	
	updatedEvent.ID = eventId
	err = updatedEvent.Update()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not update event"})
		
	}
	context.JSON(http.StatusOK, gin.H{"message" : "Updated successfully"})
	
}


func deleteEvent(context *gin.Context) {
	eventId, err := strconv.ParseInt(context.Param("id"), 10, 64) // convert string to int
	if err!= nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Could not parse event ID"})
		return
	}
		userId := context.GetInt64("userId")
		event, err := models.GetEventById(eventId)

		if err!=nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not fetch event"})
			return 
		}

		if event.UserID != userId {
			context.JSON(http.StatusUnauthorized, gin.H{"message": "Not authorized to delete event"})
			return
	
		}
	
	err = event.Delete()
	
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Could not delete the  event"})
		return 
	}

	context.JSON(http.StatusOK, gin.H{"message": "Delete event succesfully!"})
}