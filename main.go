package main

import (
	"fmt"

	"github.com/gastonjarju/rest-api/db"
	"github.com/gastonjarju/rest-api/routes"
	"github.com/gin-gonic/gin"
)

func main () {
	db.InitDB()
	fmt.Println("DB Initialized:", db.DB)

	server := gin.Default()

	routes.RegisterRoutes(server)
	server.Run(":8081") // Localhost: 8081
	
}
